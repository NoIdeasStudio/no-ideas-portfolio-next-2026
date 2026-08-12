'use client'

import type { CSSProperties } from 'react'
import Image from 'next/image'
import type { CarouselSlide, TwoUpItem } from './ProjectCarousel'
import { LottiePlayer } from './LottiePlayer'
import { AnimatedSvgPlayer } from './AnimatedSvgPlayer'
import { CarouselVideo } from './CarouselVideo'

const isSanityImage = (url: string) => url.includes('cdn.sanity.io')

function SingleMedia({
  layout,
  mediaType,
  imageUrl,
  videoUrl,
  videoUrlWebm,
  lottieUrl,
  animatedSvgUrl,
  caption,
  containPadding = '0',
  isActive,
  naturalHeight = false,
}: {
  layout: 'fullBleed' | 'contain'
  mediaType: 'image' | 'video' | 'lottie' | 'animatedSvg'
  imageUrl?: string | null
  videoUrl?: string | null
  videoUrlWebm?: string | null
  lottieUrl?: string | null
  animatedSvgUrl?: string | null
  caption?: string | null
  containPadding?: string | null
  isActive: boolean
  naturalHeight?: boolean
}) {
  const isContain = layout === 'contain'
  const useNaturalLayout = naturalHeight && layout === 'fullBleed'
  const paddingPercent = `${containPadding}%`
  const containerClass = naturalHeight
    ? 'slide-content relative w-full flex items-center justify-center overflow-hidden'
    : 'slide-content relative h-full w-full flex items-center justify-center overflow-hidden'
  const containerStyle = isContain ? { padding: paddingPercent } : undefined

  if (mediaType === 'animatedSvg' && animatedSvgUrl) {
    return (
      <div className={containerClass} style={containerStyle}>
        <AnimatedSvgPlayer
          src={animatedSvgUrl}
          fit={isContain || useNaturalLayout ? 'contain' : 'cover'}
          className={
            isContain || useNaturalLayout
              ? 'relative w-full h-auto'
              : 'absolute inset-0 h-full w-full'
          }
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

  if (mediaType === 'lottie' && lottieUrl) {
    return (
      <div className={containerClass} style={containerStyle}>
        <LottiePlayer
          src={lottieUrl}
          fit={isContain || useNaturalLayout ? 'contain' : 'cover'}
          className={
            isContain || useNaturalLayout
              ? 'relative w-full h-auto'
              : 'absolute inset-0 h-full w-full'
          }
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
        <CarouselVideo
          src={videoUrl}
          webmSrc={videoUrlWebm}
          isActive={isActive}
          isContain={isContain || useNaturalLayout}
          className={
            useNaturalLayout
              ? 'relative block w-full h-auto object-contain'
              : undefined
          }
        />
        {caption && isActive && (
          <p className="absolute bottom-4 left-4 right-4 text-xs text-white/80 text-center z-10">
            {caption}
          </p>
        )}
      </div>
    )
  }

  if (mediaType === 'image' && imageUrl) {
    /* Use img for contain/natural height so layout isn't collapsed by absolute/fill children. */
    const useNextImage = isSanityImage(imageUrl) && !isContain && !naturalHeight
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
              useNaturalLayout
                ? 'relative block w-full h-auto'
                : isContain
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

function twoUpCellProps(
  item: TwoUpItem,
  position: 'left' | 'right',
): { className: string; style: CSSProperties | undefined } {
  const isContain = item.fit === 'contain'
  const pad = item.containPadding ?? '0'
  const baseClass =
    'two-up-cell relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden flex items-center justify-center'
  const positionClass = position === 'left' ? 'two-up-cell--left' : 'two-up-cell--right'

  if (!isContain || pad === '0') {
    return { className: `${baseClass} ${positionClass}`, style: undefined }
  }

  return {
    className: `${baseClass} ${positionClass} two-up-cell--contain`,
    style: { '--two-up-pad': `${pad}%` } as CSSProperties,
  }
}

function TwoUpCell({
  item,
  isActive,
  position,
}: {
  item: TwoUpItem
  isActive: boolean
  position: 'left' | 'right'
}) {
  const { mediaType, imageUrl, videoUrl, videoUrlWebm, lottieUrl, animatedSvgUrl, backgroundVideoUrl, backgroundVideoUrlWebm, fit } = item
  const isContain = fit === 'contain'
  const { className: cellClass, style: cellStyle } = twoUpCellProps(item, position)

  if (mediaType === 'animatedSvg' && animatedSvgUrl) {
    return (
      <div className={cellClass} style={cellStyle}>
        {backgroundVideoUrl && (
          <CarouselVideo
            src={backgroundVideoUrl}
            webmSrc={backgroundVideoUrlWebm}
            isActive={isActive}
            className="absolute inset-0 z-0 h-full w-full object-cover"
          />
        )}
        <AnimatedSvgPlayer
          src={animatedSvgUrl}
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

  if (mediaType === 'lottie' && lottieUrl) {
    return (
      <div className={cellClass} style={cellStyle}>
        {backgroundVideoUrl && (
          <CarouselVideo
            src={backgroundVideoUrl}
            webmSrc={backgroundVideoUrlWebm}
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
            webmSrc={backgroundVideoUrlWebm}
            isActive={isActive}
            className="absolute inset-0 z-0 h-full w-full object-cover"
          />
        )}
        <CarouselVideo
          src={videoUrl}
          webmSrc={videoUrlWebm}
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
            webmSrc={backgroundVideoUrlWebm}
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
          webmSrc={backgroundVideoUrlWebm}
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
  naturalHeight = false,
}: {
  slide: CarouselSlide
  isActive?: boolean
  naturalHeight?: boolean
}) {
  if (slide.layout === 'twoUp') {
    const spacing = slide.twoUpSpacing ?? 'default'
    const splitGutter = spacing === 'equalCentered' || spacing === 'equalHugGutter'
    const hugGutter = spacing === 'equalHugGutter'
    const containerClass = [
      'slide-content relative h-full w-full flex flex-col md:flex-row overflow-hidden',
      splitGutter && 'two-up-equal-gutter',
      hugGutter && 'two-up-hug-gutter',
    ]
      .filter(Boolean)
      .join(' ')
    return (
      <div className={containerClass}>
        <TwoUpCell item={slide.items[0]} isActive={isActive} position="left" />
        <TwoUpCell item={slide.items[1]} isActive={isActive} position="right" />
      </div>
    )
  }

  return (
    <SingleMedia
      layout={slide.layout}
      mediaType={slide.mediaType}
      imageUrl={slide.imageUrl}
      videoUrl={slide.videoUrl}
      videoUrlWebm={slide.videoUrlWebm}
      lottieUrl={slide.lottieUrl}
      animatedSvgUrl={slide.animatedSvgUrl}
      caption={slide.caption}
      containPadding={slide.containPadding}
      isActive={isActive}
      naturalHeight={naturalHeight}
    />
  )
}
