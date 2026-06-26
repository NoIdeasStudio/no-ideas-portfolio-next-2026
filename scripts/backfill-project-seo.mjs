/**
 * Backfills project SEO descriptions from each project's short description field.
 * Skips projects that already have a custom seo.description.
 *
 * Run from project root:
 *   SANITY_API_TOKEN=your_write_token node scripts/backfill-project-seo.mjs
 */

import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

function loadEnv() {
  const path = resolve(process.cwd(), '.env.local')
  if (!existsSync(path)) return
  const content = readFileSync(path, 'utf8')
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}

function portableTextPlain(value) {
  if (typeof value === 'string') return value.trim()
  if (!Array.isArray(value)) return ''
  return value
    .map((block) => {
      if (block?._type !== 'block' || !Array.isArray(block.children)) return ''
      return block.children
        .map((child) => (child?._type === 'span' ? child.text ?? '' : ''))
        .join('')
    })
    .join('\n')
    .trim()
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
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
})

async function run() {
  const projects = await client.fetch(
    `*[_type == "project" && defined(slug.current)]{
      _id,
      title,
      description,
      seo
    }`
  )

  let updated = 0
  let skipped = 0

  for (const project of projects) {
    const existingDescription = project.seo?.description?.trim()
    if (existingDescription) {
      skipped += 1
      continue
    }

    const description = portableTextPlain(project.description)
    if (!description) {
      skipped += 1
      continue
    }

    await client
      .patch(project._id)
      .set({
        seo: {
          ...(project.seo ?? {}),
          description,
        },
      })
      .commit()

    updated += 1
    console.log(`Updated SEO description: ${project.title}`)
  }

  console.log(`Done. Updated ${updated} project(s), skipped ${skipped}.`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
