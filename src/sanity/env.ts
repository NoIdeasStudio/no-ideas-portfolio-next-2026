export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-02-17'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? process.env.SANITY_STUDIO_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET or SANITY_STUDIO_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? process.env.SANITY_STUDIO_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_STUDIO_PROJECT_ID'
)

/**
 * Public URL of the Next.js app (where `/api/draft-mode/enable` lives).
 * Set `NEXT_PUBLIC_SITE_URL` when the Studio runs on a different origin (e.g. `sanity dev` on :3333 while Next is on :3000).
 */
export function getSitePreviewOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (raw) {
    try {
      const withProto = raw.includes('://') ? raw : `https://${raw}`
      return new URL(withProto).origin
    } catch {
      // ignore invalid URL
    }
  }
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL?.trim()
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, '').split('/')[0]
    return `https://${host}`
  }
  return 'http://localhost:3000'
}

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
