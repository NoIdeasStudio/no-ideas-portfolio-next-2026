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

/** Image fields from GROQ including LQIP and dimensions. */
export type SanityImageWithMetadata = SanityImageWithAssetUrl & {
  lqip?: string | null
  dimensions?: { width?: number; height?: number } | null
}

export type ResolvedCarouselImage = {
  imageUrl: string | null
  imageLqip: string | null
  imagePlaceholderUrl: string | null
}

/** Max edge length for full-bleed carousel images (Sanity Image API resize). */
export const CAROUSEL_IMAGE_MAX_PX = 1920

/** Max edge length for 2-up carousel halves. */
export const CAROUSEL_TWO_UP_MAX_PX = 1200

/** Tiny blurred preview via Image API (contain layouts without LQIP). */
export const PLACEHOLDER_IMAGE_MAX_PX = 48

/** Max edge length for projects grid thumbs (Sanity Image API resize). */
export const GRID_IMAGE_MAX_PX = 800

function hasSanityAsset(
  image: SanityImageWithAssetUrl | null | undefined
): image is SanityImageWithAssetUrl & { asset: unknown } {
  if (!image || typeof image !== 'object') return false
  return Boolean((image as { asset?: unknown }).asset)
}

/**
 * Prefer the uploaded file URL (from GROQ `asset->url`), then external `imageUrl`,
 * then the Image API URL without width/height (respects crop/hotspot when present).
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

/** Optimized carousel URL for Sanity uploads; external URLs pass through unchanged. */
export function sanityImageCarouselUrl(
  image: SanityImageWithMetadata | null | undefined,
  externalImageUrl?: string | null,
  options?: { maxWidth?: number; quality?: number }
): string | null {
  if (externalImageUrl) return externalImageUrl
  if (!hasSanityAsset(image)) return null
  const maxWidth = options?.maxWidth ?? CAROUSEL_IMAGE_MAX_PX
  const quality = options?.quality ?? 80
  return builder
    .image(image as SanityImageSource)
    .width(maxWidth)
    .auto('format')
    .quality(quality)
    .fit('max')
    .url()
}

/** Low-res blurred URL for progressive `<img>` loading (Sanity uploads only). */
export function sanityImagePlaceholderUrl(
  image: SanityImageWithMetadata | null | undefined,
  externalImageUrl?: string | null
): string | null {
  if (externalImageUrl) return null
  if (!hasSanityAsset(image)) return null
  return builder
    .image(image as SanityImageSource)
    .width(PLACEHOLDER_IMAGE_MAX_PX)
    .blur(50)
    .auto('format')
    .quality(40)
    .url()
}

/** LQIP blur hash from GROQ (`asset->metadata.lqip`). */
export function sanityImageLqip(
  image: SanityImageWithMetadata | null | undefined
): string | null {
  if (!image || typeof image !== 'object') return null
  return (image as { lqip?: string | null }).lqip ?? null
}

/** Resolve carousel image URLs and placeholders for a slide or two-up item. */
export function resolveCarouselImage(
  image: SanityImageWithMetadata | null | undefined,
  externalImageUrl?: string | null,
  options?: { maxWidth?: number }
): ResolvedCarouselImage {
  return {
    imageUrl: sanityImageCarouselUrl(image, externalImageUrl, options),
    imageLqip: sanityImageLqip(image),
    imagePlaceholderUrl: sanityImagePlaceholderUrl(image, externalImageUrl),
  }
}

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
