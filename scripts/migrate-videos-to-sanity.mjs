/**
 * Migrates external video URLs (Digital Ocean, Webflow CDN) to Sanity file assets.
 * Updates project slides and info page news slides in place.
 *
 * Run from project root:
 *   node scripts/migrate-videos-to-sanity.mjs
 *
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN in .env.local
 * (Editor token with write access).
 *
 * Progress is cached in scripts/.migrate-videos-cache.json so re-runs skip
 * already-uploaded URLs.
 */

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, basename } from 'path'

const CACHE_PATH = resolve(process.cwd(), 'scripts/.migrate-videos-cache.json')
const EXTERNAL_HOSTS = [
  'digitaloceanspaces.com',
  'cdn.prod.website-files.com',
]

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

function loadCache() {
  if (!existsSync(CACHE_PATH)) return {}
  try {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf8'))
  } catch {
    return {}
  }
}

function saveCache(cache) {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
}

function isExternalVideoUrl(url) {
  if (!url || typeof url !== 'string') return false
  try {
    const host = new URL(url).hostname
    return EXTERNAL_HOSTS.some((h) => host.includes(h))
  } catch {
    return false
  }
}

function filenameFromUrl(url) {
  const pathname = decodeURIComponent(new URL(url).pathname)
  return basename(pathname) || 'video.mp4'
}

function contentTypeForFilename(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map = {
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
    m4v: 'video/x-m4v',
  }
  return map[ext] ?? 'video/mp4'
}

function fileRef(assetId) {
  return {
    _type: 'file',
    asset: { _type: 'reference', _ref: assetId },
  }
}

async function uploadFromUrl(url, cache) {
  if (cache[url]?.assetId) {
    console.log(`  (cached) ${filenameFromUrl(url)}`)
    return cache[url].assetId
  }

  const filename = filenameFromUrl(url)
  console.log(`  Uploading ${filename}...`)

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  }

  const buffer = Buffer.from(await res.arrayBuffer())
  const contentType = res.headers.get('content-type')?.split(';')[0]?.trim() || contentTypeForFilename(filename)

  const asset = await client.assets.upload('file', buffer, { filename, contentType })
  cache[url] = { assetId: asset._id, sanityUrl: asset.url, uploadedAt: new Date().toISOString() }
  saveCache(cache)
  console.log(`  → ${asset.url} (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`)
  return asset._id
}

async function migrateUrlField(obj, urlKey, fileKey, cache) {
  const url = obj[urlKey]
  if (!isExternalVideoUrl(url)) return obj

  const assetId = await uploadFromUrl(url, cache)
  const next = { ...obj }
  next[fileKey] = fileRef(assetId)
  delete next[urlKey]
  return next
}

async function migrateTwoUpItem(item, cache) {
  let next = { ...item }
  next = await migrateUrlField(next, 'videoUrl', 'videoFile', cache)
  next = await migrateUrlField(next, 'backgroundVideoUrl', 'backgroundVideoFile', cache)
  return next
}

async function migrateSlide(slide, cache) {
  let next = { ...slide }
  next = await migrateUrlField(next, 'videoUrl', 'videoFile', cache)
  next = await migrateUrlField(next, 'backgroundVideoUrl', 'backgroundVideoFile', cache)
  if (Array.isArray(next.items)) {
    next.items = await Promise.all(next.items.map((item) => migrateTwoUpItem(item, cache)))
  }
  return next
}

function collectUrlsFromSlide(slide, urls) {
  if (isExternalVideoUrl(slide.videoUrl)) urls.add(slide.videoUrl)
  if (isExternalVideoUrl(slide.backgroundVideoUrl)) urls.add(slide.backgroundVideoUrl)
  for (const item of slide.items ?? []) {
    if (isExternalVideoUrl(item.videoUrl)) urls.add(item.videoUrl)
    if (isExternalVideoUrl(item.backgroundVideoUrl)) urls.add(item.backgroundVideoUrl)
  }
}

async function main() {
  const cache = loadCache()

  const projects = await client.fetch(`*[_type == "project"]{ _id, title, slides }`)
  const infoPage = await client.fetch(
    `*[_type == "infoPage" && _id == "info-page"][0]{ _id, newsSection }`
  )

  const uniqueUrls = new Set()
  for (const project of projects) {
    for (const slide of project.slides ?? []) {
      collectUrlsFromSlide(slide, uniqueUrls)
    }
  }
  for (const row of infoPage?.newsSection?.rows ?? []) {
    for (const post of row.posts ?? []) {
      for (const slide of post.slides ?? []) {
        collectUrlsFromSlide(slide, uniqueUrls)
      }
    }
  }

  console.log(`Found ${uniqueUrls.size} unique external video URL(s) across ${projects.length} project(s).\n`)

  if (uniqueUrls.size === 0) {
    console.log('Nothing to migrate.')
    return
  }

  // Pre-upload all unique URLs (deduplicated)
  for (const url of uniqueUrls) {
    await uploadFromUrl(url, cache)
  }

  console.log('\nPatching documents...\n')

  for (const project of projects) {
    const slides = project.slides ?? []
    const hasExternal = slides.some(
      (s) =>
        isExternalVideoUrl(s.videoUrl) ||
        isExternalVideoUrl(s.backgroundVideoUrl) ||
        (s.items ?? []).some(
          (i) => isExternalVideoUrl(i.videoUrl) || isExternalVideoUrl(i.backgroundVideoUrl)
        )
    )
    if (!hasExternal) continue

    const migratedSlides = await Promise.all(slides.map((s) => migrateSlide(s, cache)))
    await client.patch(project._id).set({ slides: migratedSlides }).commit()
    console.log(`  Patched project: ${project.title}`)
  }

  if (infoPage?.newsSection?.rows?.length) {
    let newsChanged = false
    const rows = await Promise.all(
      infoPage.newsSection.rows.map(async (row) => {
        const posts = await Promise.all(
          (row.posts ?? []).map(async (post) => {
            const slides = post.slides ?? []
            const hasExternal = slides.some(
              (s) => isExternalVideoUrl(s.videoUrl) || isExternalVideoUrl(s.backgroundVideoUrl)
            )
            if (!hasExternal) return post
            newsChanged = true
            return {
              ...post,
              slides: await Promise.all(slides.map((s) => migrateSlide(s, cache))),
            }
          })
        )
        return { ...row, posts }
      })
    )
    if (newsChanged) {
      await client
        .patch(infoPage._id)
        .set({ newsSection: { ...infoPage.newsSection, rows } })
        .commit()
      console.log('  Patched info page news section')
    }
  }

  console.log('\nDone. Videos are now hosted on cdn.sanity.io.')
  console.log(`Cache saved to ${CACHE_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
