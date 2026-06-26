const DEFAULT_DEV_ORIGIN = 'http://localhost:3000'

function normalizeOrigin(url?: string | null): string | undefined {
  const trimmed = url?.trim()
  if (!trimmed) return undefined
  return trimmed.replace(/\/$/, '')
}

/** Frontend origin loaded in the Presentation iframe. */
export function getPreviewOrigin(): string {
  const envOrigin =
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeOrigin(process.env.SANITY_STUDIO_PREVIEW_ORIGIN)

  if (typeof window !== 'undefined') {
    // Standalone Studio (`sanity dev`) runs on a different port than Next.js.
    if (window.location.port === '3333' || window.location.port === '3334') {
      return envOrigin || DEFAULT_DEV_ORIGIN
    }
    return window.location.origin
  }

  return envOrigin || DEFAULT_DEV_ORIGIN
}

/** Studio URL used by stega / visual editing overlays. */
export function getStudioUrl(): string {
  const previewOrigin = getPreviewOrigin()
  return `${previewOrigin}/studio`
}

export const previewAllowOrigins = [
  'http://localhost:3000',
  'http://localhost:3333',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3333',
] as const
