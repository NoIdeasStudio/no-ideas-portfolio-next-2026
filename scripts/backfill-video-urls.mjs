/**
 * Backfills legacy videoUrl / backgroundVideoUrl from uploaded Sanity file assets.
 * Run after migrate-videos-to-sanity.mjs so older deployed builds (without GROQ
 * coalesce) still resolve video URLs until the next deploy.
 *
 *   node scripts/backfill-video-urls.mjs
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

async function resolveFileUrl(fileField) {
  if (!fileField?.asset?._ref) return null
  const asset = await client.fetch(`*[_id == $id][0].url`, { id: fileField.asset._ref })
  return asset ?? null
}

async function enrichSlide(slide) {
  const next = { ...slide }

  if (next.videoFile?.asset?._ref && !next.videoUrl) {
    next.videoUrl = await resolveFileUrl(next.videoFile)
  }
  if (next.backgroundVideoFile?.asset?._ref && !next.backgroundVideoUrl) {
    next.backgroundVideoUrl = await resolveFileUrl(next.backgroundVideoFile)
  }
  if (Array.isArray(next.items)) {
    next.items = await Promise.all(
      next.items.map(async (item) => {
        const enriched = { ...item }
        if (enriched.videoFile?.asset?._ref && !enriched.videoUrl) {
          enriched.videoUrl = await resolveFileUrl(enriched.videoFile)
        }
        if (enriched.backgroundVideoFile?.asset?._ref && !enriched.backgroundVideoUrl) {
          enriched.backgroundVideoUrl = await resolveFileUrl(enriched.backgroundVideoFile)
        }
        return enriched
      })
    )
  }
  return next
}

async function main() {
  const projects = await client.fetch(`*[_type == "project"]{ _id, title, slides }`)
  let patched = 0

  for (const project of projects) {
    const slides = project.slides ?? []
    const needsPatch = slides.some(
      (s) =>
        (s.videoFile?.asset?._ref && !s.videoUrl) ||
        (s.backgroundVideoFile?.asset?._ref && !s.backgroundVideoUrl) ||
        (s.items ?? []).some(
          (i) =>
            (i.videoFile?.asset?._ref && !i.videoUrl) ||
            (i.backgroundVideoFile?.asset?._ref && !i.backgroundVideoUrl)
        )
    )
    if (!needsPatch) continue

    const enrichedSlides = await Promise.all(slides.map(enrichSlide))
    await client.patch(project._id).set({ slides: enrichedSlides }).commit()
    console.log(`  Patched ${project.title}`)
    patched++
  }

  const infoPage = await client.fetch(
    `*[_type == "infoPage" && _id == "info-page"][0]{ _id, newsSection }`
  )
  if (infoPage?.newsSection?.rows?.length) {
    let newsChanged = false
    const rows = await Promise.all(
      infoPage.newsSection.rows.map(async (row) => {
        const posts = await Promise.all(
          (row.posts ?? []).map(async (post) => {
            const slides = post.slides ?? []
            const needsPatch = slides.some(
              (s) =>
                (s.videoFile?.asset?._ref && !s.videoUrl) ||
                (s.backgroundVideoFile?.asset?._ref && !s.backgroundVideoUrl)
            )
            if (!needsPatch) return post
            newsChanged = true
            return {
              ...post,
              slides: await Promise.all(slides.map(enrichSlide)),
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
      patched++
    }
  }

  console.log(patched ? `\nDone. Backfilled ${patched} document(s).` : '\nNothing to backfill.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
