'use client'

import { useEffect, useRef, useState } from 'react'
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

function ProgressiveImage({
  src,
  alt,
  className,
  placeholderUrl,
  lqip,
  objectFit,
}: {
  src: string
  alt: string
  className: string
  placeholderUrl?: string | null
  lqip?: string | null
  objectFit: 'cover' | 'contain'
}) {
  const [loaded, setLoaded] = useState(false)
  const fitClass = objectFit === 'contain' ? 'object-contain' : 'object-cover'
  const hasPlaceholder = Boolean(lqip || placeholderUrl)

  return (
    <>
      {lqip && (
        <img
          src={lqip}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full ${fitClass} scale-105 blur-lg transition-opacity duration-300 ${loaded ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      {!lqip && placeholderUrl && (
        <img
          src={placeholderUrl}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full ${fitClass} transition-opacity duration-300 ${loaded ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        decoding="async"
        loading="eager"
        className={`${className} transition-opacity duration-300 ${hasPlaceholder && !loaded ? 'opacity-0' : 'opacity-100'}`}
      />
    </>
  )
}

function SingleMedia({
  layout,
  mediaType,
  imageUrl,
  imageLqip,
  imagePlaceholderUrl,
  videoUrl,
  lottieUrl,
  caption,
  containPadding = '0',
  isActive,
}: {
  layout: 'fullBleed' | 'contain'
  mediaType: 'image' | 'video' | 'lottie'
  imageUrl?: string | null
  imageLqip?: string | null
  imagePlaceholderUrl?: string | null
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
    const useNextImage = isSanityImage(imageUrl) && !isContain
    const blurDataURL = imageLqip ?? undefined
    const imgClass = isContain
      ? 'relative max-h-full max-w-full w-auto h-auto object-contain'
      : 'absolute inset-0 w-full h-full object-cover'

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
            placeholder={blurDataURL ? 'blur' : 'empty'}
            blurDataURL={blurDataURL}
          />
        ) : (
          <ProgressiveImage
            src={imageUrl}
            alt={caption || ''}
            className={imgClass}
            lqip={imageLqip}
            placeholderUrl={imagePlaceholderUrl}
            objectFit={isContain ? 'contain' : 'cover'}
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
  const {
    mediaType,
    imageUrl,
    imageLqip,
    imagePlaceholderUrl,
    videoUrl,
    lottieUrl,
    backgroundVideoUrl,
    fit,
    containPadding,
  } = item
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
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <LottiePlayer
          src={lottieUrl}
          fit={isContain ? 'contain' : 'cover'}
          className={isContain ? 'relative h-full w-full' : 'absolute inset-0 h-full w-full'}
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
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <CarouselVideo src={videoUrl} isActive={isActive} isContain={isContain} />
      </div>
    )
  }

  if (mediaType === 'image' && imageUrl) {
    const useNextImage = isSanityImage(imageUrl) && !isContain
    const blurDataURL = imageLqip ?? undefined
    const imgClass = isContain
      ? 'relative max-h-full max-w-full w-auto h-auto object-contain'
      : 'absolute inset-0 w-full h-full object-cover'

    return (
      <div className={cellClass} style={cellStyle}>
        {backgroundVideoUrl && (
          <CarouselVideo
            src={backgroundVideoUrl}
            isActive={isActive}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {useNextImage ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="50vw"
            priority={isActive}
            placeholder={blurDataURL ? 'blur' : 'empty'}
            blurDataURL={blurDataURL}
          />
        ) : (
          <ProgressiveImage
            src={imageUrl}
            alt=""
            className={imgClass}
            lqip={imageLqip}
            placeholderUrl={imagePlaceholderUrl}
            objectFit={isContain ? 'contain' : 'cover'}
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
          className="absolute inset-0 h-full w-full object-cover"
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
      imageLqip={slide.imageLqip}
      imagePlaceholderUrl={slide.imagePlaceholderUrl}
      videoUrl={slide.videoUrl}
      lottieUrl={slide.lottieUrl}
      caption={slide.caption}
      containPadding={slide.containPadding}
      isActive={isActive}
    />
  )
}
