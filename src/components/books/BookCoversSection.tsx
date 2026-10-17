'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useAutoScroll } from '../../contexts/AutoScrollContext'
import { useProjectTheme } from '../../contexts/ProjectThemeContext'
import type { BookSpec } from '../../data/books'

const BookStage = dynamic(() => import('./BookStage').then((mod) => mod.BookStage), {
  ssr: false,
})

export const BOOK_COVERS_SLUG = 'book-covers'
export const BOOK_COVERS_TITLE = 'Book Covers'

/**
 * Mount while the section is still two screens away, so the cover is drawn
 * before it scrolls into view. Percentages are relative to the viewport.
 */
const STAGE_MARGIN = '200%'

type StageSlot = { distance: number }
const stageSlots = new Map<HTMLElement, StageSlot>()
const stageListeners = new Set<() => void>()
let activeStage: HTMLElement | null = null

function chooseStage() {
  let next: HTMLElement | null = null
  let best = Infinity
  for (const [el, slot] of stageSlots) {
    if (slot.distance < best) {
      best = slot.distance
      next = el
    }
  }
  if (next === activeStage) return
  activeStage = next
  stageListeners.forEach((listener) => listener())
}

function trackStage(el: HTMLElement, distance: number | null) {
  if (distance == null) stageSlots.delete(el)
  else stageSlots.set(el, { distance })
  chooseStage()
}

function stageDistance(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const middle = rect.top + rect.height / 2
  return Math.abs(middle - window.innerHeight / 2)
}

type BookCoversSectionProps = {
  isLoopCopy?: boolean
  books: BookSpec[]
}

/**
 * Homepage slot for the book viewer.
 * The section always takes a viewport of height so the loop measurement stays stable.
 * The three.js chunk and the first cover start loading with the page. Once that
 * cover is ready, its canvas stays mounted so the book is already drawn when
 * the section scrolls in. The loop duplicate mounts two screens early and only
 * one WebGL context stays live; the nearer copy wins.
 */
export function BookCoversSection({ isLoopCopy = false, books }: BookCoversSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [mounted, setMounted] = useState(false)
  const [prepared, setPrepared] = useState(false)
  const autoScroll = useAutoScroll()
  const { activeProjectSlug, setThemeColor, setActiveProjectTitle } = useProjectTheme() ?? {
    activeProjectSlug: null,
    setThemeColor: () => {},
    setActiveProjectTitle: () => {},
  }
  const sectionId = isLoopCopy ? undefined : BOOK_COVERS_SLUG
  const active = !isLoopCopy && activeProjectSlug === BOOK_COVERS_SLUG

  useEffect(() => {
    if (isLoopCopy) return
    void import('./BookStage')
    const first = books[0]
    if (!first) return
    for (const url of [first.maps?.cover, first.maps?.varnish, first.maps?.foil, first.maps?.deboss]) {
      if (!url) continue
      const image = new Image()
      image.decoding = 'async'
      image.src = url
    }

    let cancelled = false
    const warm = () => {
      if (cancelled) return
      void import('./BookObject').then((mod) => {
        if (cancelled) return
        void mod.warmBook(first).finally(() => {
          if (!cancelled) setPrepared(true)
        })
        void (async () => {
          await mod.warmBook(first)
          for (const book of books.slice(1)) {
            if (cancelled) return
            await mod.warmBook(book)
            await new Promise<void>((resolve) => {
              window.setTimeout(resolve, 48)
            })
          }
        })()
      })
    }
    const idleId = window.requestIdleCallback?.(warm, { timeout: 1000 })
    const timer = idleId == null ? window.setTimeout(warm, 300) : 0
    return () => {
      cancelled = true
      if (idleId != null) window.cancelIdleCallback(idleId)
      if (timer) window.clearTimeout(timer)
    }
  }, [books, isLoopCopy])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const sync = () => setMounted(activeStage === el)
    stageListeners.add(sync)

    let near = false
    const publish = () => {
      const eligible = near || (!isLoopCopy && prepared)
      trackStage(el, eligible ? stageDistance(el) : null)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        near = Boolean(entry?.isIntersecting)
        publish()
      },
      { rootMargin: `${STAGE_MARGIN} 0px ${STAGE_MARGIN} 0px` },
    )
    observer.observe(el)
    publish()

    const onScroll = () => {
      if (!stageSlots.has(el)) return
      trackStage(el, stageDistance(el))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    sync()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      stageListeners.delete(sync)
      trackStage(el, null)
    }
  }, [isLoopCopy, prepared])

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
          books={books}
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
