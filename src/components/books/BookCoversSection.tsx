'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useAutoScroll } from '../../contexts/AutoScrollContext'
import { useProjectTheme } from '../../contexts/ProjectThemeContext'

const BookStage = dynamic(() => import('./BookStage').then((mod) => mod.BookStage), {
  ssr: false,
})

export const BOOK_COVERS_SLUG = 'book-covers'
export const BOOK_COVERS_TITLE = 'Book Covers'

/** Start the WebGL chunk just before the section enters. */
const MOUNT_MARGIN = '480px'
/**
 * Drop the canvas once the section is more than a viewport away.
 * IntersectionObserver only accepts px or %, not vh.
 */
const KEEP_MARGIN = '100%'

type BookCoversSectionProps = {
  isLoopCopy?: boolean
}

/**
 * Homepage slot for the book viewer.
 * The section always takes a viewport of height so the loop measurement stays stable.
 * Three.js stays out of the homepage bundle until this section is near the screen,
 * and the canvas unmounts after you scroll past so the rest of the page does not
 * keep a live WebGL context. The infinite-loop copy uses the same rule, so only
 * one canvas exists at a time.
 */
export function BookCoversSection({ isLoopCopy = false }: BookCoversSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [mounted, setMounted] = useState(false)
  const autoScroll = useAutoScroll()
  const { activeProjectSlug, setThemeColor, setActiveProjectTitle } = useProjectTheme() ?? {
    activeProjectSlug: null,
    setThemeColor: () => {},
    setActiveProjectTitle: () => {},
  }
  const sectionId = isLoopCopy ? undefined : BOOK_COVERS_SLUG
  const active = !isLoopCopy && activeProjectSlug === BOOK_COVERS_SLUG

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const mountObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setMounted(true)
      },
      { rootMargin: `${MOUNT_MARGIN} 0px ${MOUNT_MARGIN} 0px` },
    )
    const keepObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) setMounted(false)
      },
      { rootMargin: `${KEEP_MARGIN} 0px ${KEEP_MARGIN} 0px` },
    )

    mountObserver.observe(el)
    keepObserver.observe(el)
    return () => {
      mountObserver.disconnect()
      keepObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!active) return
    setActiveProjectTitle(BOOK_COVERS_TITLE)
    setThemeColor('#fff')
  }, [active, setActiveProjectTitle, setThemeColor])

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className="project-viewport-height relative w-full flex-shrink-0 overflow-hidden bg-black"
      aria-label="Project: Book Covers"
    >
      {mounted ? (
        <BookStage
          contained
          listenToKeys={active}
          onInteract={() =>
            autoScroll?.onCarouselInteraction(BOOK_COVERS_SLUG, { isLoopCopy })
          }
        />
      ) : null}
    </section>
  )
}
