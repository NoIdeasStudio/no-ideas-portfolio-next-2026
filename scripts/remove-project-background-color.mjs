/**
 * Removes the old project-level `backgroundColor` field from all project documents.
 * Run this once after moving background color to the slide level.
 *
 * Run from project root:
 *   SANITY_API_TOKEN=your_write_token node scripts/remove-project-background-color.mjs
 *
 * Get a token: https://manage.sanity.io → Project → API → Tokens → Add API token (Editor).
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
  console.error('  SANITY_API_TOKEN=xxx node scripts/remove-project-background-color.mjs')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
})

async function main() {
  const ids = await client.fetch(`*[_type == "project"]._id`)
  if (!ids?.length) {
    console.log('No project documents found.')
    return
  }
  console.log(`Found ${ids.length} project(s). Removing old backgroundColor field...`)
  for (const id of ids) {
    await client.patch(id).unset(['backgroundColor']).commit()
    console.log(`  Patched ${id}`)
  }
  console.log('Done. The "Unknown field" warning in Studio should disappear after you refresh.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
