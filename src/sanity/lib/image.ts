import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

/** Image from GROQ with optional direct CDN file URL (`asset->url`). */
export type SanityImageWithAssetUrl = SanityImageSource & {
  assetUrl?: string | null
}

/**
 * Serve the native uploaded file when available.
 * Prefer external `imageUrl`, then GROQ `asset->url`, then Image API URL
 * without width/quality transforms (respects crop/hotspot when present).
 */
export function sanityImageServeUrl(
  image: SanityImageWithAssetUrl | null | undefined,
  externalImageUrl?: string | null
): string | null {
  if (externalImageUrl) return externalImageUrl
  if (!image || typeof image !== 'object') return null
  const ref = image as { asset?: unknown; assetUrl?: string | null }
  if (ref.assetUrl) return ref.assetUrl
  if (!ref.asset) return null
  return builder.image(image as SanityImageSource).url()
}

/**
 * Projects grid: keep external `imageUrl` as-is; for Sanity uploads use compressed thumbs.
 */
export const GRID_IMAGE_MAX_PX = 800

export function sanityImageGridUrl(
  image: SanityImageWithAssetUrl | null | undefined,
  externalImageUrl: string | null | undefined,
  variant: 'contain' | 'coverSquare'
): string | null {
  if (externalImageUrl) return externalImageUrl
  if (!image || typeof image !== 'object') return null
  const ref = image as { asset?: unknown; assetUrl?: string | null }
  if (!ref.asset) {
    return ref.assetUrl ?? null
  }
  const base = builder.image(image as SanityImageSource)
  if (variant === 'contain') {
    return base.width(GRID_IMAGE_MAX_PX).fit('max').url()
  }
  return base.width(GRID_IMAGE_MAX_PX).height(GRID_IMAGE_MAX_PX).fit('max').url()
}
