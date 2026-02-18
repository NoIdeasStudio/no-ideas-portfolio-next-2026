'use client'

import Image from 'next/image'
import type { CarouselSlide, TwoUpItem } from './ProjectCarousel'

const isSanityImage = (url: string) => url.includes('cdn.sanity.io')

function SingleMedia({
  layout,
  mediaType,
  imageUrl,
  videoUrl,
  caption,
  containPadding = '0',
}: {
  layout: 'fullBleed' | 'contain'
  mediaType: 'image' | 'video'
  imageUrl?: string | null
  videoUrl?: string | null
  caption?: string | null
  containPadding?: string | null
}) {
  const isContain = layout === 'contain'
  const paddingPercent = `${containPadding}%`
  const containerClass = `slide-content relative h-full w-full flex items-center justify-center overflow-hidden`
  const containerStyle = isContain ? { padding: paddingPercent } : undefined

  if (mediaType === 'video' && videoUrl) {
    return (
      <div className={containerClass} style={containerStyle}>
        <video
          src={videoUrl}
          className={
            isContain
              ? 'video-contain max-h-full max-w-full object-contain w-auto h-auto'
              : 'video-cover absolute inset-0 h-full w-full object-cover'
          }
          playsInline
          muted
          loop
          autoPlay
        />
        {caption && (
          <p className="absolute bottom-4 left-4 right-4 text-xs text-white/80 text-center z-10">
            {caption}
          </p>
        )}
      </div>
    )
  }

  if (mediaType === 'image' && imageUrl) {
    /* Use img for contain so it respects padding and isn't cropped (Next/Image fill is absolute and can crop). */
    const useNextImage = isSanityImage(imageUrl) && !isContain
    return (
      <div className={containerClass} style={containerStyle}>
        {useNextImage ? (
          <Image
            src={imageUrl}
            alt={caption || ''}
            fill
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <img
            src={imageUrl}
            alt={caption || ''}
            className={
              isContain
                ? 'relative max-h-full max-w-full w-auto h-auto object-contain'
                : 'absolute inset-0 w-full h-full object-cover'
            }
            loading={isContain ? 'eager' : 'lazy'}
          />
        )}
        {caption && (
          <p className="absolute bottom-4 left-4 right-4 text-xs text-white/80 text-center z-10">
            {caption}
          </p>
        )}
      </div>
    )
  }

  return null
}

function TwoUpCell({ item }: { item: TwoUpItem }) {
  const { mediaType, imageUrl, videoUrl, fit, containPadding } = item
  const isContain = fit === 'contain'
  const paddingPercent = isContain ? `${containPadding ?? '0'}%` : '0'
  const cellClass =
    'relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden flex items-center justify-center'

  const cellStyle = isContain ? { padding: paddingPercent } : undefined

  if (mediaType === 'video' && videoUrl) {
    return (
      <div className={cellClass} style={cellStyle}>
        <video
          src={videoUrl}
          className={
            isContain
              ? 'relative max-h-full max-w-full w-auto h-auto object-contain'
              : 'absolute inset-0 w-full h-full object-cover'
          }
          playsInline
          muted
          loop
          autoPlay
        />
      </div>
    )
  }

  if (mediaType === 'image' && imageUrl) {
    const useNextImage = isSanityImage(imageUrl) && !isContain
    return (
      <div className={cellClass} style={cellStyle}>
        {useNextImage ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="50vw"
          />
        ) : (
          <img
            src={imageUrl}
            alt=""
            className={
              isContain
                ? 'relative max-h-full max-w-full w-auto h-auto object-contain'
                : 'absolute inset-0 w-full h-full object-cover'
            }
            loading={isContain ? 'eager' : 'lazy'}
          />
        )}
      </div>
    )
  }

  return <div className={cellClass} />
}

export function Slide({ slide }: { slide: CarouselSlide }) {
  if (slide.layout === 'twoUp') {
    return (
      <div className="slide-content relative h-full w-full flex flex-col md:flex-row overflow-hidden">
        <TwoUpCell item={slide.items[0]} />
        <TwoUpCell item={slide.items[1]} />
      </div>
    )
  }

  return (
    <SingleMedia
      layout={slide.layout}
      mediaType={slide.mediaType}
      imageUrl={slide.imageUrl}
      videoUrl={slide.videoUrl}
      caption={slide.caption}
      containPadding={slide.containPadding}
    />
  )
}
