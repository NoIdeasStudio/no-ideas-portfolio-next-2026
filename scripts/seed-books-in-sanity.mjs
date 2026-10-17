/**
 * Publishes one book document per built cover, the slideshow order, and the
 * Site Layout marker after Parsons / before Morgensterns.
 *
 *   node scripts/seed-books-in-sanity.mjs
 */

import { createClient } from '@sanity/client'
import { createReadStream, existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const PLATES = ['cover', 'varnish', 'foil', 'deboss']

function loadEnv() {
  const path = resolve(process.cwd(), '.env.local')
  if (!existsSync(path)) return
  const content = readFileSync(path, 'utf8')
  for (const line of content.split('\n')) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
}

function booksFromSource() {
  const source = readFileSync(resolve(process.cwd(), 'src/data/books.ts'), 'utf8')
  const catalog = source.slice(source.indexOf('export const books'))
  const chunks = catalog.split(/\n  \{\n/).slice(1)
  const specs = []
  for (const chunk of chunks) {
    const slug = chunk.match(/slug: '([^']+)'/)?.[1]
    const title = chunk.match(/title: '([^']+)'/)?.[1]
    const description = chunk.match(/description:\s*'([^']*)'/)?.[1]
    const mapsBlock = chunk.match(/maps:\s*\{([\s\S]*?)\n    \}/)
    const plates = {}
    if (mapsBlock) {
      for (const name of PLATES) {
        const plate = mapsBlock[1].match(new RegExp(`${name}:\\s*'([^']+)'`))
        if (plate) plates[name] = plate[1].split('?')[0]
      }
    }
    if (!slug || !title) continue
    specs.push({ slug, title, description, plates })
  }
  return specs
}

loadEnv()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId || !token) {
  console.error('Need NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-02-19',
  useCdn: false,
  token,
})

async function insertSlideshowMarker(id) {
  const doc = await client.getDocument(id)
  if (!doc?.projectOrder) {
    console.log(`Skipped ${id}: no project order`)
    return
  }
  if (doc.projectOrder.some((item) => item?._type === 'bookSlideshow')) {
    console.log(`${id} already includes the book slideshow`)
    return
  }

  const projects = await client.fetch(
    `*[_type == "project" && slug.current in $slugs]{ _id, "slug": slug.current }`,
    { slugs: ['parsons', 'morgentsterns'] },
  )
  const parsons = projects.find((project) => project.slug === 'parsons')
  const morgensterns = projects.find((project) => project.slug === 'morgentsterns')
  const order = [...doc.projectOrder]
  const parsonsIndex = parsons ? order.findIndex((item) => item?._ref === parsons._id) : -1
  const morgensternsIndex = morgensterns
    ? order.findIndex((item) => item?._ref === morgensterns._id)
    : -1

  let insertAt = order.length
  if (parsonsIndex >= 0 && morgensternsIndex === parsonsIndex + 1) insertAt = parsonsIndex + 1
  else if (parsonsIndex >= 0 && morgensternsIndex > parsonsIndex) insertAt = morgensternsIndex
  else if (parsonsIndex >= 0) insertAt = parsonsIndex + 1
  else if (morgensternsIndex >= 0) insertAt = morgensternsIndex

  order.splice(insertAt, 0, {
    _key: 'bookSlideshow',
    _type: 'bookSlideshow',
    label: 'Book slideshow',
  })
  await client.patch(id).set({ projectOrder: order }).commit()
  console.log(`Inserted book slideshow in ${id} at position ${insertAt + 1}`)
}

async function uploadPlates(specs) {
  for (const book of specs) {
    const id = `book-${book.slug}`
    const doc = await client.getDocument(id)
    if (!doc) continue
    const set = {}
    for (const name of PLATES) {
      const url = book.plates[name]
      if (!url || doc[name]?.asset) continue
      const filePath = resolve(process.cwd(), 'public', url.replace(/^\//, ''))
      if (!existsSync(filePath)) {
        console.log(`Missing ${filePath}`)
        continue
      }
      const asset = await client.assets.upload('image', createReadStream(filePath), {
        filename: `${book.slug}-${name}.png`,
      })
      set[name] = {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
      }
      console.log(`Uploaded ${book.slug} ${name}`)
    }
    let patch = client.patch(id).unset(['hidden'])
    if (Object.keys(set).length > 0) patch = patch.set(set)
    await patch.commit()
  }
}

async function run() {
  const specs = booksFromSource()
  if (specs.length === 0) {
    console.error('No books found in src/data/books.ts')
    process.exit(1)
  }

  const tx = client.transaction()
  for (const book of specs) {
    tx.createIfNotExists({
      _id: `book-${book.slug}`,
      _type: 'book',
      title: book.title,
      ...(book.description ? { description: book.description } : {}),
      slug: book.slug,
    })
  }
  tx.createIfNotExists({
    _id: 'book-order',
    _type: 'bookOrder',
    books: specs.map((book) => ({
      _key: book.slug,
      _type: 'reference',
      _ref: `book-${book.slug}`,
    })),
  })
  await tx.commit()
  console.log(`Books: ${specs.length} documents, slideshow order book-order`)
  await uploadPlates(specs)

  await insertSlideshowMarker('site-layout')
  const draft = await client.getDocument('drafts.site-layout')
  if (draft) await insertSlideshowMarker('drafts.site-layout')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
