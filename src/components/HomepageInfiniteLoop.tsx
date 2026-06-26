'use client'

import { useEffect, useRef, useState } from 'react'
import type { PortableTextBlock } from '@portabletext/types'
import { useAutoScroll } from '../contexts/AutoScrollContext'
import { isMobileUserAgent } from '../lib/isMobile'
import { HomepageThemeObserver } from './HomepageThemeObserver'
import { LazyLoopSection } from './LazyLoopSection'
import { MobileViewportHeightExpand } from './MobileViewportHeightExpand'
import type { CarouselSlide } from './ProjectCarousel'
import type { ProjectCategory } from './ProjectInfoPanel'

export type HomepageProject = {
  _id: string
  title: string
  slug: string
  description?: unknown
  extendedDescription?: PortableTextBlock[] | null
  categories?: ProjectCategory[]
  year?: string | null
  visitUrl?: string | null
  recognition?: PortableTextBlock[] | null
  credits?: PortableTextBlock[] | null
  themeColor?: string | null
  slides: CarouselSlide[]
}

type HomepageInfiniteLoopProps = {
  projects: HomepageProject[]
  themeObserverProjects: { slug: string }[]
  /** When false, skip the duplicate loop block (e.g. single-project SEO pages). */
  enableLoopDuplicate?: boolean
}

export function HomepageInfiniteLoop({
  projects,
  themeObserverProjects,
  enableLoopDuplicate = true,
}: HomepageInfiniteLoopProps) {
  const loopRef = useRef<HTMLDivElement>(null)
  const setLoopHeight = useAutoScroll()?.setLoopHeight
  const [showLoopDuplicate, setShowLoopDuplicate] = useState(false)

  useEffect(() => {
    setShowLoopDuplicate(enableLoopDuplicate && !isMobileUserAgent())
  }, [enableLoopDuplicate])

  useEffect(() => {
    if (!loopRef.current || !setLoopHeight) return
    const el = loopRef.current
    const observer = new ResizeObserver(() => {
      setLoopHeight(el.offsetHeight)
    })
    observer.observe(el)
    setLoopHeight(el.offsetHeight)
    return () => {
      observer.disconnect()
      setLoopHeight(0)
    }
  }, [setLoopHeight, projects.length])

  return (
    <>
      <MobileViewportHeightExpand />
      <HomepageThemeObserver projects={themeObserverProjects} />
      <div ref={loopRef} aria-hidden={false}>
        {projects.map((project, i) => (
          <LazyLoopSection
            key={project._id}
            project={project}
            mountImmediately={i === 0}
          />
        ))}
      </div>
      {showLoopDuplicate && (
        <div aria-hidden="true">
          {projects.map((project) => (
            <LazyLoopSection
              key={`${project._id}-loop`}
              project={project}
              isLoopCopy
            />
          ))}
        </div>
      )}
    </>
  )
}
