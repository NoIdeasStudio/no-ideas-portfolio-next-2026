'use client'

import { useEffect, useState, useCallback } from 'react'
import { PortableText } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/types'
import { useProjectTheme } from '../contexts/ProjectThemeContext'
import { Slide } from './Slide'

export type TwoUpItem = {
  mediaType: 'image' | 'video'
  imageUrl?: string | null
  videoUrl?: string | null
  fit?: 'cover' | 'contain'
  containPadding?: string | null
}

export type CarouselSlide =
  | {
      layout: 'fullBleed' | 'contain'
      mediaType: 'image' | 'video'
      imageUrl?: string | null
      videoUrl?: string | null
      caption?: string | null
      containPadding?: string | null
      backgroundColor?: string | null
      themeColor?: string
    }
  | {
      layout: 'twoUp'
      items: [TwoUpItem, TwoUpItem]
      backgroundColor?: string | null
      themeColor?: string
    }

type ProjectCarouselProps = {
  projectTitle: string
  projectDescription?: PortableTextBlock[] | string | null
  projectSlug?: string
  themeColor?: string
  slides: CarouselSlide[]
}

export function ProjectCarousel({
  projectTitle,
  projectDescription,
  projectSlug,
  themeColor: projectThemeColor = '#fff',
  slides,
}: ProjectCarouselProps) {
  const [index, setIndex] = useState(0)
  const {
    activeProjectSlug,
    setThemeColor,
    setActiveProjectTitle,
    descriptionOpenSlug,
  } = useProjectTheme() ?? {
    activeProjectSlug: null,
    setThemeColor: () => {},
    setActiveProjectTitle: () => {},
    descriptionOpenSlug: null,
  }
  const descriptionOpen = descriptionOpenSlug === projectSlug
  const count = slides.length
  const hasMultiple = count > 1
  const current = slides[index]
  const slideTheme =
    current && 'themeColor' in current && current.themeColor != null
      ? current.themeColor
      : undefined
  const effectiveTheme = slideTheme ?? projectThemeColor
  const themeStyle = { color: effectiveTheme }
  const themeStyleMuted = { color: effectiveTheme, opacity: 0.95 }

  useEffect(() => {
    if (projectSlug && activeProjectSlug === projectSlug) {
      setThemeColor(effectiveTheme)
      setActiveProjectTitle(projectTitle)
    }
  }, [projectSlug, activeProjectSlug, effectiveTheme, setThemeColor, projectTitle, setActiveProjectTitle])

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? count - 1 : i - 1))
  }, [count])

  const goNext = useCallback(() => {
    setIndex((i) => (i >= count - 1 ? 0 : i + 1))
  }, [count])

  if (!count) return null

  return (
    <section
      id={projectSlug ?? undefined}
      className="hero-slider relative h-screen w-full overflow-hidden bg-black"
      aria-label={`Project: ${projectTitle}`}
    >
      {/* Slider mask: one visible slide */}
      <div className="relative h-full w-full">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 h-full w-full transition-opacity duration-300 ease-linear"
            style={{
              opacity: i === index ? 1 : 0,
              pointerEvents: i === index ? 'auto' : 'none',
              backgroundColor: slide.backgroundColor ?? '#000000',
            }}
            aria-hidden={i !== index}
          >
            <Slide slide={slide} />
          </div>
        ))}
      </div>

      {/* Left nav: 40% width, cursor w-resize (system left arrow) */}
      {hasMultiple && (
        <button
          type="button"
          onClick={goPrev}
          className="slider-arrow-left absolute left-0 top-0 z-10 h-full w-[40%] cursor-w-resize focus:outline-none"
          aria-label="Previous slide"
        />
      )}

      {/* Right nav: 40% width, cursor e-resize (system right arrow) */}
      {hasMultiple && (
        <button
          type="button"
          onClick={goNext}
          className="slider-arrow-right absolute right-0 top-0 z-10 h-full w-[40%] cursor-e-resize focus:outline-none"
          aria-label="Next slide"
        />
      )}

      {/* Description only (bottom left), opened via header title click — type-size-1, same padding as header */}
      <div className="absolute bottom-0 left-0 z-10 max-w-[80%] py-[1.3%] px-[2%]">
        <div className="type-size-1" style={themeStyle}>
          {descriptionOpen && projectDescription && (
            <div
              className="mt-2 project-description-content"
              style={{
                ...themeStyleMuted,
                textShadow: '0 4px 4px rgba(0, 0, 0, 0.45)',
              }}
            >
              {Array.isArray(projectDescription) && projectDescription.length > 0 ? (
                <PortableText
                  value={projectDescription}
                  components={{
                    block: {
                      normal: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
                    },
                    marks: {
                      link: ({ value, children }) => (
                        <a
                          href={value?.href}
                          target={value?.blank ? '_blank' : undefined}
                          rel={value?.blank ? 'noopener noreferrer' : undefined}
                        >
                          {children}
                        </a>
                      ),
                    },
                  }}
                />
              ) : typeof projectDescription === 'string' ? (
                <p className="whitespace-pre-wrap">{projectDescription}</p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Slide counter (bottom right) — type-size-1, same padding as header */}
      <div className="absolute bottom-0 right-0 z-10 py-[1.3%] px-[2%]">
        <p className="type-size-1 text-right" style={themeStyle} aria-live="polite">
          {index + 1} / {count}
        </p>
      </div>

    </section>
  )
}
