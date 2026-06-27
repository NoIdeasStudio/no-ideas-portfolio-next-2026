/**
 * Creates or replaces the Site Settings singleton in Sanity with launch-ready defaults.
 *
 * Run from project root:
 *   SANITY_API_TOKEN=your_write_token node scripts/seed-site-settings-in-sanity.mjs
 *
 * Upload favicon, Apple touch icon, and social share image in Studio after running.
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.noideas.website'

const siteSettingsDoc = {
  _id: 'site-settings',
  _type: 'siteSettings',
  title: 'No Ideas',
  siteUrl,
  googleAnalyticsId: 'G-P2PCFLQFKC',
  seo: {
    title: 'No Ideas',
    description:
      'No Ideas is a graphic design studio in Brooklyn, New York. We create visual identities, websites, printed matter, editorial design, and art direction for commercial and cultural clients.',
    noIndex: false,
  },
}

async function run() {
  const draftDoc = { ...siteSettingsDoc, _id: 'drafts.site-settings' }
  const publishedDoc = { ...siteSettingsDoc, _id: 'site-settings' }

  await client.createOrReplace(draftDoc)
  await client.createOrReplace(publishedDoc)

  console.log('Site Settings: draft (drafts.site-settings) and published (site-settings) created/updated.')
  console.log(`  Site URL: ${siteUrl}`)
  console.log('  Next: upload favicon, Apple touch icon, and social share image in Studio → Site Settings.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
