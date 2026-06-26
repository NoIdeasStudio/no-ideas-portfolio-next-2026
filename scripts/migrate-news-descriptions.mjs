/**
 * Converts news post descriptions from plain strings to portable text blocks.
 * Run once after changing newsPost.description from `text` to `array`.
 *
 * Run from project root:
 *   SANITY_API_TOKEN=your_write_token node scripts/migrate-news-descriptions.mjs
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

loadEnv()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_PROJECT_ID in .env.local')
  process.exit(1)
}
if (!token) {
  console.error('Missing SANITY_API_TOKEN. Create a token at https://manage.sanity.io (Editor) and run:')
  console.error('  SANITY_API_TOKEN=xxx node scripts/migrate-news-descriptions.mjs')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
})

function randomKey() {
  return Math.random().toString(36).slice(2, 11)
}

/** Plain string → single normal portable text block (no links). */
function stringToPortableText(text) {
  const trimmed = text.trim()
  if (!trimmed) return []
  return [
    {
      _type: 'block',
      _key: randomKey(),
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: randomKey(),
          text: trimmed,
          marks: [],
        },
      ],
    },
  ]
}

function migrateNewsSection(newsSection) {
  if (!newsSection?.rows?.length) return { newsSection, changed: 0 }

  let changed = 0
  const rows = newsSection.rows.map((row) => {
    if (!row?.posts?.length) return row
    const posts = row.posts.map((post) => {
      if (typeof post?.description !== 'string') return post
      changed += 1
      return {
        ...post,
        description: stringToPortableText(post.description),
      }
    })
    return { ...row, posts }
  })

  return {
    newsSection: { ...newsSection, rows },
    changed,
  }
}

async function migrateDocument(id) {
  const doc = await client.fetch(`*[_id == $id][0]`, { id })
  if (!doc) {
    console.log(`  Skipped ${id} (not found)`)
    return 0
  }

  const { newsSection, changed } = migrateNewsSection(doc.newsSection)
  if (changed === 0) {
    console.log(`  ${id}: no string descriptions to migrate`)
    return 0
  }

  await client.patch(id).set({ newsSection }).commit()
  console.log(`  ${id}: migrated ${changed} description(s)`)
  return changed
}

async function main() {
  const ids = ['info-page', 'drafts.info-page']
  let total = 0
  for (const id of ids) {
    total += await migrateDocument(id)
  }
  if (total === 0) {
    console.log('Nothing to migrate.')
  } else {
    console.log(`Done. Migrated ${total} description(s). Refresh Studio.`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
