/**
 * Creates one example project in Sanity: "DUMBO Open Studios 2025"
 * with the same slides as on the Webflow site (video + 2 images).
 *
 * Run from project root:
 *   SANITY_API_TOKEN=your_write_token node scripts/seed-dumbo-in-sanity.mjs
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
  console.error('  SANITY_API_TOKEN=xxx node scripts/seed-dumbo-in-sanity.mjs')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
})

const CDN = 'https://cdn.prod.website-files.com/6570d6395abf1c6e896cc7f6'
const VIDEO = 'https://no-ideas-portfolio.nyc3.cdn.digitaloceanspaces.com'

const dumboProject = {
  _id: 'dumbo-open-studios-2025',
  _type: 'project',
  title: 'DUMBO Open Studios 2025',
  slug: { _type: 'slug', current: 'dumbo-open-studios-2025' },
  slides: [
    {
      _type: 'slide',
      _key: 'slide-1',
      layout: 'fullBleed',
      mediaType: 'video',
      videoUrl: `${VIDEO}/no-ideas-identity-design-dumbo-open-studios-2.mp4`,
    },
    {
      _type: 'slide',
      _key: 'slide-2',
      layout: 'fullBleed',
      mediaType: 'image',
      imageUrl: `${CDN}/68701e85efac4b2ec06a91fa_dos-2025-1.avif`,
    },
    {
      _type: 'slide',
      _key: 'slide-3',
      layout: 'fullBleed',
      mediaType: 'image',
      imageUrl: `${CDN}/68701ea9dda4f59f6b2b1265_dos-2025-2png.avif`,
    },
  ],
}

async function main() {
  try {
    await client.createOrReplace(dumboProject)
    console.log('Created project in Sanity: "DUMBO Open Studios 2025" with 3 slides.')
    console.log('Restart or refresh your Next.js app — you should see this project from Sanity (and no longer the seed list).')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
