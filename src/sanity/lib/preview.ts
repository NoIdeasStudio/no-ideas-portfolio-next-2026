/**
 * Staging / preview deployments show Sanity drafts (unpublished changes).
 * Production shows published content only.
 *
 * Enabled when:
 * - SANITY_PREVIEW_MODE=true (local dev or explicit Vercel config), or
 * - VERCEL_ENV=preview (Vercel Preview deployments on non-production branches)
 *
 * Set SANITY_PREVIEW_MODE=false on Production in Vercel to be explicit.
 */
export function isStagingPreview(): boolean {
  const flag = process.env.SANITY_PREVIEW_MODE?.trim().toLowerCase()
  if (flag === 'true') return true
  if (flag === 'false') return false
  return process.env.VERCEL_ENV === 'preview'
}

/** Staging sites should never be indexed by search engines. */
export function shouldBlockSearchIndexing(): boolean {
  return isStagingPreview()
}
