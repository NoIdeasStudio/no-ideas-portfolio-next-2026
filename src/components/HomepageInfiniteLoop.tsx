'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { PortableTextBlock } from '@portabletext/types'
import { useAutoScroll } from '../contexts/AutoScrollContext'
import { isMobileUserAgent } from '../lib/isMobile'
import { BOOK_COVERS_SLUG, BookCoversSection } from './books/BookCoversSection'
import { HomepageThemeObserver } from './HomepageThemeObserver'
import { LazyLoopSection } from './LazyLoopSection'
import { MobileViewportHeightExpand } from './MobileViewportHeightExpand'
import type { CarouselSlide } from './ProjectCarousel'
import type { ProjectCategory } from './ProjectInfoPanel'

/** Published homepage order: Parsons Lecture Series, then Morgensterns. */
const PARSONS_SLUG = 'parsons'
const MORGENSTERNS_SLUG = 'morgentsterns'

type LoopEntry =
  | { kind: 'project'; project: HomepageProject }
  | { kind: 'book-covers' }

function withBookCovers(projects: HomepageProject[]): LoopEntry[] {
  const entries: LoopEntry[] = projects.map((project) => ({ kind: 'project', project }))
  const parsons = projects.findIndex((project) => project.slug === PARSONS_SLUG)
  if (parsons === -1 || projects[parsons + 1]?.slug !== MORGENSTERNS_SLUG) return entries
  entries.splice(parsons + 1, 0, { kind: 'book-covers' })
  return entries
}

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
  /** When false, skip the duplicate loop block (e.g. single-project SEO pages). */
  enableLoopDuplicate?: boolean
}

export function HomepageInfiniteLoop({
  projects,
  enableLoopDuplicate = true,
}: HomepageInfiniteLoopProps) {
  const loopRef = useRef<HTMLDivElement>(null)
  const setLoopHeight = useAutoScroll()?.setLoopHeight
  const [showLoopDuplicate, setShowLoopDuplicate] = useState(false)
  const entries = useMemo(() => withBookCovers(projects), [projects])
  const themeObserverProjects = useMemo(
    () =>
      entries.map((entry) => ({
        slug: entry.kind === 'book-covers' ? BOOK_COVERS_SLUG : entry.project.slug,
      })),
    [entries],
  )

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
        {entries.map((entry, i) =>
          entry.kind === 'book-covers' ? (
            <BookCoversSection key={BOOK_COVERS_SLUG} />
          ) : (
            <LazyLoopSection
              key={entry.project._id}
              project={entry.project}
              mountImmediately={i === 0}
            />
          ),
        )}
      </div>
      {showLoopDuplicate && (
        <div aria-hidden="true">
          {entries.map((entry) =>
            entry.kind === 'book-covers' ? (
              <BookCoversSection key={`${BOOK_COVERS_SLUG}-loop`} isLoopCopy />
            ) : (
              <LazyLoopSection
                key={`${entry.project._id}-loop`}
                project={entry.project}
                isLoopCopy
              />
            ),
          )}
        </div>
      )}
    </>
  )
}
