'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { CarouselSlide, TwoUpItem } from './ProjectCarousel'
import { LottiePlayer } from './LottiePlayer'

const isSanityImage = (url: string) => url.includes('cdn.sanity.io')

export function CarouselVideo({
  src,
  className,
  isActive,
  isContain = false,
}: {
  src: string
  className?: string
  isActive: boolean
  isContain?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (isActive) {
      void video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [isActive])

  return (
    <video
      ref={ref}
      src={src}
      className={
        className ??
        (isContain
          ? 'video-contain max-h-full max-w-full object-contain w-auto h-auto'
          : 'video-cover absolute inset-0 h-full w-full object-cover')
      }
      playsInline
      muted
      loop
      preload="auto"
    />
  )
}

function SingleMedia({
  layout,
  mediaType,
  imageUrl,
  videoUrl,
  lottieUrl,
  caption,
  containPadding = '0',
  isActive,
}: {
  layout: 'fullBleed' | 'contain'
  mediaType: 'image' | 'video' | 'lottie'
  imageUrl?: string | null
  videoUrl?: string | null
  lottieUrl?: string | null
  caption?: string | null
  containPadding?: string | null
  isActive: boolean
}) {
  const isContain = layout === 'contain'
  const paddingPercent = `${containPadding}%`
  const containerClass = `slide-content relative h-full w-full flex items-center justify-center overflow-hidden`
  const containerStyle = isContain ? { padding: paddingPercent } : undefined

  if (mediaType === 'lottie' && lottieUrl) {
    return (
      <div className={containerClass} style={containerStyle}>
        <LottiePlayer
          src={lottieUrl}
          fit={isContain ? 'contain' : 'cover'}
          className={isContain ? 'relative h-full w-full' : 'absolute inset-0 h-full w-full'}
          autoplay={isActive}
        />
        {caption && isActive && (
          <p className="absolute bottom-4 left-4 right-4 text-xs text-white/80 text-center z-10">
            {caption}
          </p>
        )}
      </div>
    )
  }

  if (mediaType === 'video' && videoUrl) {
    return (
      <div className={containerClass} style={containerStyle}>
        <CarouselVideo src={videoUrl} isActive={isActive} isContain={isContain} />
        {caption && isActive && (
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
            priority={isActive}
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
            loading="eager"
            decoding="async"
          />
        )}
        {caption && isActive && (
          <p className="absolute bottom-4 left-4 right-4 text-xs text-white/80 text-center z-10">
            {caption}
          </p>
        )}
      </div>
    )
  }

  return null
}

function TwoUpCell({ item, isActive }: { item: TwoUpItem; isActive: boolean }) {
  const { mediaType, imageUrl, videoUrl, lottieUrl, backgroundVideoUrl, fit, containPadding } = item
  const isContain = fit === 'contain'
  const paddingPercent = isContain ? `${containPadding ?? '0'}%` : '0'
  const cellClass =
    'relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden flex items-center justify-center'

  const cellStyle = isContain ? { padding: paddingPercent } : undefined

  if (mediaType === 'lottie' && lottieUrl) {
    return (
      <div className={cellClass} style={cellStyle}>
        {backgroundVideoUrl && (
          <CarouselVideo
            src={backgroundVideoUrl}
            isActive={isActive}
            className="absolute inset-0 z-0 h-full w-full object-cover"
          />
        )}
        <LottiePlayer
          src={lottieUrl}
          fit={isContain ? 'contain' : 'cover'}
          className={
            isContain
              ? 'relative z-10 h-full w-full'
              : 'absolute inset-0 z-10 h-full w-full'
          }
          autoplay={isActive}
        />
      </div>
    )
  }

  if (mediaType === 'video' && videoUrl) {
    return (
      <div className={cellClass} style={cellStyle}>
        {backgroundVideoUrl && (
          <CarouselVideo
            src={backgroundVideoUrl}
            isActive={isActive}
            className="absolute inset-0 z-0 h-full w-full object-cover"
          />
        )}
        <CarouselVideo
          src={videoUrl}
          isActive={isActive}
          isContain={isContain}
          className={
            isContain
              ? 'relative z-10 video-contain max-h-full max-w-full object-contain w-auto h-auto'
              : 'absolute inset-0 z-10 h-full w-full object-cover'
          }
        />
      </div>
    )
  }

  if (mediaType === 'image' && imageUrl) {
    const useNextImage = isSanityImage(imageUrl) && !isContain
    return (
      <div className={cellClass} style={cellStyle}>
        {backgroundVideoUrl && (
          <CarouselVideo
            src={backgroundVideoUrl}
            isActive={isActive}
            className="absolute inset-0 z-0 h-full w-full object-cover"
          />
        )}
        {useNextImage ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="z-10 object-cover"
            sizes="50vw"
            priority={isActive}
          />
        ) : (
          <img
            src={imageUrl}
            alt=""
            className={
              isContain
                ? 'relative z-10 max-h-full max-w-full w-auto h-auto object-contain'
                : 'absolute inset-0 z-10 w-full h-full object-cover'
            }
            loading="eager"
            decoding="async"
          />
        )}
      </div>
    )
  }

  return (
    <div className={cellClass}>
      {backgroundVideoUrl && (
        <CarouselVideo
          src={backgroundVideoUrl}
          isActive={isActive}
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
      )}
    </div>
  )
}

export function Slide({
  slide,
  isActive = true,
}: {
  slide: CarouselSlide
  isActive?: boolean
}) {
  if (slide.layout === 'twoUp') {
    return (
      <div className="slide-content relative h-full w-full flex flex-col md:flex-row overflow-hidden">
        <TwoUpCell item={slide.items[0]} isActive={isActive} />
        <TwoUpCell item={slide.items[1]} isActive={isActive} />
      </div>
    )
  }

  return (
    <SingleMedia
      layout={slide.layout}
      mediaType={slide.mediaType}
      imageUrl={slide.imageUrl}
      videoUrl={slide.videoUrl}
      lottieUrl={slide.lottieUrl}
      caption={slide.caption}
      containPadding={slide.containPadding}
      isActive={isActive}
    />
  )
}
