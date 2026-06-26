'use client'

import { useCallback, useState } from 'react'
import { PortableText } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/types'
import { formatNewsTimestamp } from '../lib/formatNewsTimestamp'
import { linkablePortableTextComponents } from '../lib/linkablePortableText'
import { Slide, CarouselVideo } from './Slide'
import type { CarouselSlide } from './ProjectCarousel'

export type NewsSlide = Extract<CarouselSlide, { layout: 'fullBleed' | 'contain' }>

export type NewsPostProps = {
  aspectRatio: 'native' | 'square' | '3:4'
  limitViewportHeight: boolean
  sidePadding: boolean
  slides: NewsSlide[]
  publishedAt: string
  description: PortableTextBlock[] | string
}

export function NewsPostSlideshow({
  aspectRatio,
  limitViewportHeight = false,
  sidePadding = false,
  slides,
  publishedAt,
  description,
}: NewsPostProps) {
  const [index, setIndex] = useState(0)
  const count = slides.length
  const hasMultiple = count > 1
  const isNative = aspectRatio === 'native'

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? count - 1 : i - 1))
  }, [count])

  const goNext = useCallback(() => {
    setIndex((i) => (i >= count - 1 ? 0 : i + 1))
  }, [count])

  const aspectClass =
    aspectRatio === 'square'
      ? 'news-post-slideshow--square'
      : aspectRatio === '3:4'
        ? 'news-post-slideshow--3-4'
        : 'news-post-slideshow--native'

  return (
    <article className={`news-post${sidePadding ? ' news-post--side-padding' : ''}`}>
      <div
        className={`news-post-inner${isNative ? ' news-post-inner--native' : ''}${limitViewportHeight ? ' news-post-inner--viewport-height' : ''}`}
      >
        <div
          className={`news-post-slideshow ${aspectClass}${limitViewportHeight ? ' news-post-slideshow--viewport-height' : ''}`}
          role={hasMultiple ? 'group' : undefined}
          aria-label={hasMultiple ? 'Slideshow' : undefined}
        >
          <div className="news-post-slideshow-track">
            {slides.map((slide, i) => {
              const isActive = i === index
              return (
                <div
                  key={i}
                  className="news-post-slide"
                  style={{
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    backgroundColor: slide.backgroundColor ?? '#000000',
                  }}
                  aria-hidden={!isActive}
                >
                  {slide.backgroundVideoUrl && (
                    <CarouselVideo
                      src={slide.backgroundVideoUrl}
                      isActive={isActive}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <Slide slide={slide} isActive={isActive} naturalHeight={isNative} />
                </div>
              )
            })}
          </div>

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="news-post-nav news-post-nav--prev"
                aria-label="Previous slide"
              />
              <button
                type="button"
                onClick={goNext}
                className="news-post-nav news-post-nav--next"
                aria-label="Next slide"
              />
            </>
          )}
        </div>

        <div className="news-post-meta">
          <time className="news-post-timestamp" dateTime={publishedAt}>
            {formatNewsTimestamp(publishedAt)}
          </time>
          <div className="news-post-description">
            {Array.isArray(description) ? (
              <PortableText
                value={description}
                components={linkablePortableTextComponents}
              />
            ) : (
              <p className="project-info-para">{description}</p>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
