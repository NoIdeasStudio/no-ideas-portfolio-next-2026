'use client'

import { useEffect, useRef, useState } from 'react'
import type { PortableTextBlock } from '@portabletext/types'
import { ProjectCarousel } from './ProjectCarousel'
import type { HomepageProject } from './HomepageInfiniteLoop'

/** Start loading when section is within this distance of the viewport (px). */
const LOAD_THRESHOLD_PX = 800

type LazyLoopSectionProps = {
  project: HomepageProject
  /** Duplicate block in infinite loop — no section id. */
  isLoopCopy?: boolean
  /** Mount carousel immediately (e.g. first homepage project for LCP). */
  mountImmediately?: boolean
}

function getFirstSlideBg(project: HomepageProject): string {
  const first = project.slides?.[0]
  if (first && 'backgroundColor' in first && first.backgroundColor) {
    return first.backgroundColor
  }
  return '#000000'
}

function shouldMountFromHash(slug: string): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hash === `#${slug}`
}

/**
 * Renders a lightweight placeholder until the section is near the viewport,
 * then mounts the full ProjectCarousel. Used for off-screen homepage projects
 * and duplicate blocks in the infinite loop.
 */
export function LazyLoopSection({
  project,
  isLoopCopy = false,
  mountImmediately = false,
}: LazyLoopSectionProps) {
  const [inView, setInView] = useState(mountImmediately)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const sectionId = !isLoopCopy ? project.slug : undefined

  useEffect(() => {
    if (mountImmediately || inView) return
    if (shouldMountFromHash(project.slug)) {
      setInView(true)
    }
  }, [mountImmediately, inView, project.slug])

  useEffect(() => {
    if (inView) return
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
  }, [inView])

  const carousel = (
    <ProjectCarousel
      projectTitle={project.title}
      projectDescription={
        (project.description ?? null) as PortableTextBlock[] | string | null
      }
      extendedDescription={project.extendedDescription}
      projectCategories={project.categories ?? []}
      projectYear={project.year}
      visitUrl={project.visitUrl}
      recognition={project.recognition}
      credits={project.credits}
      projectSlug={project.slug}
      themeColor={project.themeColor ?? '#fff'}
      slides={project.slides ?? []}
      isLoopCopy={isLoopCopy}
      omitSectionId={Boolean(sectionId)}
    />
  )

  if (inView) {
    return (
      <div ref={wrapperRef} id={sectionId}>
        {carousel}
      </div>
    )
  }

  return (
    <div
      ref={wrapperRef}
      id={sectionId}
        className="relative h-screen w-full flex-shrink-0"
      style={{ backgroundColor: getFirstSlideBg(project) }}
      aria-label={`Project: ${project.title} (loading)`}
    />
  )
}
