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

/** Max width for full-bleed / contain carousel images (Sanity Image API). */
export const CAROUSEL_FULL_BLEED_MAX_PX = 1600

/** Max width per cell in two-up carousel slides (~50vw on desktop). */
export const CAROUSEL_TWO_UP_MAX_PX = 900

/**
 * Prefer external `imageUrl`, then compressed Sanity Image API URL.
 * External URLs are passed through unchanged.
 */
export function resolveCarouselImage(
  image: SanityImageWithAssetUrl | null | undefined,
  externalImageUrl?: string | null,
  options?: { maxWidth?: number }
): string | null {
  if (externalImageUrl) return externalImageUrl
  if (!image || typeof image !== 'object') return null

  const ref = image as { asset?: unknown; assetUrl?: string | null }
  if (!ref.asset) return ref.assetUrl ?? null

  const maxWidth = options?.maxWidth ?? CAROUSEL_FULL_BLEED_MAX_PX
  return builder
    .image(image as SanityImageSource)
    .width(maxWidth)
    .fit('max')
    .auto('format')
    .quality(80)
    .url()
}

/**
 * Prefer the uploaded file URL (from GROQ `asset->url`), then external `imageUrl`,
 * then the Image API URL without width/height (respects crop/hotspot when present).
 */
export function sanityImageServeUrl(
  image: SanityImageWithAssetUrl | null | undefined,
  externalImageUrl?: string | null
): string | null {
  return resolveCarouselImage(image, externalImageUrl)
}

/** Max edge length for projects grid thumbs (Sanity Image API resize). */
export const GRID_IMAGE_MAX_PX = 800

/**
 * Projects grid: keep external `imageUrl` as-is; for Sanity uploads use compressed thumbs.
 */
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
