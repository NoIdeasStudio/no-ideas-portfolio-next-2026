'use client'

import { useEffect, useState, useCallback } from 'react'
import type { PortableTextBlock } from '@portabletext/types'
import { useProjectTheme } from '../contexts/ProjectThemeContext'
import { useAutoScroll } from '../contexts/AutoScrollContext'
import { ProjectInfoPanel, type ProjectCategory } from './ProjectInfoPanel'
import { Slide } from './Slide'

export type TwoUpItem = {
  mediaType: 'image' | 'video' | 'lottie'
  imageUrl?: string | null
  videoUrl?: string | null
  lottieUrl?: string | null
  backgroundVideoUrl?: string | null
  fit?: 'cover' | 'contain'
  containPadding?: string | null
}

export type CarouselSlide =
  | {
      layout: 'fullBleed' | 'contain'
      mediaType: 'image' | 'video' | 'lottie'
      imageUrl?: string | null
      videoUrl?: string | null
      lottieUrl?: string | null
      caption?: string | null
      containPadding?: string | null
      backgroundColor?: string | null
      backgroundVideoUrl?: string | null
      themeColor?: string
    }
  | {
      layout: 'twoUp'
      items: [TwoUpItem, TwoUpItem]
      backgroundColor?: string | null
      backgroundVideoUrl?: string | null
      themeColor?: string
    }

type ProjectCarouselProps = {
  projectTitle: string
  projectDescription?: PortableTextBlock[] | string | null
  projectCategories?: ProjectCategory[]
  projectYear?: string | null
  visitUrl?: string | null
  recognition?: PortableTextBlock[] | null
  credits?: PortableTextBlock[] | null
  projectSlug?: string
  themeColor?: string
  slides: CarouselSlide[]
  /** When true, section has no id (used for duplicate in infinite loop). */
  isLoopCopy?: boolean
}

export function ProjectCarousel({
  projectTitle,
  projectDescription,
  projectCategories = [],
  projectYear,
  visitUrl,
  recognition,
  credits,
  projectSlug,
  themeColor: projectThemeColor = '#fff',
  slides,
  isLoopCopy = false,
}: ProjectCarouselProps) {
  const [index, setIndex] = useState(0)
  const {
    activeProjectSlug,
    setThemeColor,
    setActiveProjectTitle,
    descriptionOpenSlug,
    setDescriptionOpenSlug,
    infoExpandedSlug,
    setInfoExpandedSlug,
  } = useProjectTheme() ?? {
    activeProjectSlug: null,
    setThemeColor: () => {},
    setActiveProjectTitle: () => {},
    descriptionOpenSlug: null,
    setDescriptionOpenSlug: () => {},
    infoExpandedSlug: null,
    setInfoExpandedSlug: () => {},
  }
  const autoScroll = useAutoScroll()
  const descriptionOpen = descriptionOpenSlug === projectSlug
  const infoExpanded = infoExpandedSlug === projectSlug
  const count = slides.length
  const hasMultiple = count > 1
  const current = slides[index]
  const slideTheme =
    current && 'themeColor' in current && current.themeColor != null
      ? current.themeColor
      : undefined
  const effectiveTheme = slideTheme ?? projectThemeColor
  const themeStyle = { color: effectiveTheme }

  useEffect(() => {
    if (projectSlug && activeProjectSlug === projectSlug) {
      setThemeColor(effectiveTheme)
      setActiveProjectTitle(projectTitle)
    }
  }, [projectSlug, activeProjectSlug, effectiveTheme, setThemeColor, projectTitle, setActiveProjectTitle])

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? count - 1 : i - 1))
    projectSlug &&
      autoScroll?.onCarouselInteraction(projectSlug, { isLoopCopy: isLoopCopy ?? false })
  }, [count, projectSlug, autoScroll, isLoopCopy])

  const goNext = useCallback(() => {
    setIndex((i) => (i >= count - 1 ? 0 : i + 1))
    projectSlug &&
      autoScroll?.onCarouselInteraction(projectSlug, { isLoopCopy: isLoopCopy ?? false })
  }, [count, projectSlug, autoScroll, isLoopCopy])

  const hasDescription =
    !!projectSlug &&
    (Array.isArray(projectDescription)
      ? projectDescription.length > 0
      : typeof projectDescription === 'string' && projectDescription.trim().length > 0)

  const closeInfo = useCallback(() => {
    if (!projectSlug) return
    setDescriptionOpenSlug(null)
    setInfoExpandedSlug(null)
  }, [projectSlug, setDescriptionOpenSlug, setInfoExpandedSlug])

  const handleInfoClick = useCallback(() => {
    if (!projectSlug) return
    if (descriptionOpenSlug === projectSlug) {
      closeInfo()
    } else {
      setDescriptionOpenSlug(projectSlug)
      setInfoExpandedSlug(null)
    }
    autoScroll?.onCarouselInteraction(projectSlug, { isLoopCopy: isLoopCopy ?? false })
  }, [
    projectSlug,
    descriptionOpenSlug,
    closeInfo,
    setDescriptionOpenSlug,
    setInfoExpandedSlug,
    autoScroll,
    isLoopCopy,
  ])

  const handleExpandInfo = useCallback(() => {
    if (!projectSlug) return
    setInfoExpandedSlug(projectSlug)
  }, [projectSlug, setInfoExpandedSlug])

  const handleCollapseInfo = useCallback(() => {
    setInfoExpandedSlug(null)
  }, [setInfoExpandedSlug])

  if (!count) return null

  return (
    <section
      id={isLoopCopy ? undefined : (projectSlug ?? undefined)}
      className="hero-slider relative h-screen w-full overflow-hidden bg-black"
      aria-label={`Project: ${projectTitle}`}
    >
      {/* Slider mask: one visible slide */}
      <div className="relative h-full w-full">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 h-full w-full"
            style={{
              opacity: i === index ? 1 : 0,
              pointerEvents: i === index ? 'auto' : 'none',
              backgroundColor: slide.backgroundColor ?? '#000000',
            }}
            aria-hidden={i !== index}
          >
            {slide.backgroundVideoUrl && (
              <video
                src={slide.backgroundVideoUrl}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            <Slide slide={slide} />
          </div>
        ))}
      </div>

      {/* Left nav: 40% width, cursor w-resize (system left arrow) */}
      {hasMultiple && !infoExpanded && (
        <button
          type="button"
          onClick={goPrev}
          className="slider-arrow-left absolute left-0 top-0 z-10 h-full w-[40%] cursor-w-resize focus:outline-none"
          aria-label="Previous slide"
        />
      )}

      {/* Right nav: 40% width, cursor e-resize (system right arrow) */}
      {hasMultiple && !infoExpanded && (
        <button
          type="button"
          onClick={goNext}
          className="slider-arrow-right absolute right-0 top-0 z-10 h-full w-[40%] cursor-e-resize focus:outline-none"
          aria-label="Next slide"
        />
      )}

      {/* Info trigger (bottom left) */}
      <div className="absolute bottom-0 left-0 z-20 max-w-[80%] py-[1.3%] px-[2%] pointer-events-none">
        <div className="type-size-1 pointer-events-auto" style={themeStyle}>
          {hasDescription && !infoExpanded && (
            <button
              type="button"
              onClick={handleInfoClick}
              className="project-info-trigger block text-left font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
              aria-expanded={descriptionOpen}
              aria-controls={projectSlug ? `project-info-${projectSlug}` : undefined}
            >
              Info
            </button>
          )}
        </div>
      </div>

      <ProjectInfoPanel
        projectSlug={projectSlug ?? ''}
        description={projectDescription}
        categories={projectCategories}
        year={projectYear}
        visitUrl={visitUrl}
        recognition={recognition}
        credits={credits}
        isOpen={descriptionOpen}
        isExpanded={infoExpanded}
        onClose={closeInfo}
        onExpand={handleExpandInfo}
        onCollapse={handleCollapseInfo}
      />

      {/* Slide counter (bottom right) — type-size-1, same padding as header */}
      {!infoExpanded && (
        <div className="absolute bottom-0 right-0 z-10 py-[1.3%] px-[2%]">
          <p className="type-size-1 text-right" style={themeStyle} aria-live="polite">
            {index + 1} / {count}
          </p>
        </div>
      )}
    </section>
  )
}
