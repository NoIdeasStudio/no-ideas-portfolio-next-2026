'use client'

import { useEffect, useRef, useState } from 'react'
import type { PortableTextBlock } from '@portabletext/types'
import { ProjectCarousel } from './ProjectCarousel'
import type { HomepageProject } from './HomepageInfiniteLoop'

/** Start loading when section is within this distance of the viewport (px). */
const LOAD_THRESHOLD_PX = 800

type LazyLoopSectionProps = {
  project: HomepageProject
}

/**
 * Renders a lightweight placeholder until the section is near the viewport,
 * then mounts the full ProjectCarousel (images/videos). Used for the duplicate
 * block in the infinite loop to avoid loading all duplicate media up front.
 */
export function LazyLoopSection({ project }: LazyLoopSectionProps) {
  const [inView, setInView] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true)
      },
      {
        root: null,
        rootMargin: `${LOAD_THRESHOLD_PX}px 0px ${LOAD_THRESHOLD_PX}px 0px`,
        threshold: 0,
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const firstSlideBg =
    project.slides?.[0] && 'backgroundColor' in project.slides[0]
      ? (project.slides[0].backgroundColor as string) ?? '#000000'
      : '#000000'

  if (!inView) {
    return (
      <div
        ref={wrapperRef}
        className="relative h-screen w-full flex-shrink-0"
        style={{ backgroundColor: firstSlideBg }}
        aria-label={`Project: ${project.title} (loading)`}
      />
    )
  }

  return (
    <div ref={wrapperRef}>
      <ProjectCarousel
        projectTitle={project.title}
        projectDescription={
          (project.description ?? null) as PortableTextBlock[] | string | null
        }
        projectSlug={project.slug}
        themeColor={project.themeColor ?? '#fff'}
        slides={project.slides ?? []}
        isLoopCopy
      />
    </div>
  )
}
