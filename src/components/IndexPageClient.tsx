'use client'

import Link from 'next/link'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'

/** Wraps text so it ellipsizes when overflow; on hover, scrolls to reveal hidden text. */
function ScrollRevealCell({ children, className }: { children: string; className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)

  const handleMouseEnter = () => {
    const wrapper = wrapperRef.current
    const inner = innerRef.current
    if (!wrapper || !inner) return
    const overflow = inner.scrollWidth - wrapper.clientWidth
    if (overflow > 0) {
      inner.style.transform = `translateX(-${overflow}px)`
    }
  }

  const handleMouseLeave = () => {
    const inner = innerRef.current
    if (inner) inner.style.transform = ''
  }

  return (
    <div
      ref={wrapperRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span ref={innerRef} className="index-project-cell-inner">
        {children}
      </span>
    </div>
  )
}

/** Wraps text; only when content overflows, on hover runs infinite ticker (content duplicated). */
function TickerCell({ children, className }: { children: string; className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [hasOverflow, setHasOverflow] = useState(false)

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const measure = measureRef.current
    if (!wrapper || !measure) return

    const check = () => {
      setHasOverflow(measure.scrollWidth > wrapper.clientWidth)
    }

    check()
    const ro = new ResizeObserver(check)
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [children])

  return (
    <div ref={wrapperRef} className={className}>
      <span
        ref={measureRef}
        aria-hidden
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {children}
      </span>
      {hasOverflow ? (
        <span className="index-project-cell-inner index-project-cell-inner--ticker">
          {children}
          <span className="index-project-ticker-gap" aria-hidden="true" />
          {children}
        </span>
      ) : (
        <span className="index-project-cell-inner">{children}</span>
      )}
    </div>
  )
}

export type IndexCategory = {
  _id: string
  title: string
  slug: string
}

export type IndexProject = {
  _id: string
  title: string
  slug: string
  categories?: (IndexCategory | null)[] | null
  year?: string | null
}

type IndexPageClientProps = {
  categories: IndexCategory[]
  projects: IndexProject[]
}

export function IndexPageClient({ categories, projects }: IndexPageClientProps) {
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return projects
    return projects.filter(
      (p) =>
        Array.isArray(p.categories) &&
        p.categories.some((c) => c && c._id === filter)
    )
  }, [projects, filter])

  return (
    <div className="index type-size-1">
      <div className="index-filters">
        <button
          type="button"
          className={`index-filter ${filter === 'all' ? 'selected' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {categories.length > 0 && (
          <>
            <span className="comma">,</span>
            {categories.map((cat, i) => (
              <span key={cat._id}>
                {' '}
                <button
                  type="button"
                  className={`index-filter ${filter === cat._id ? 'selected' : ''}`}
                  onClick={() => setFilter(cat._id)}
                >
                  {cat.title}
                </button>
                {i < categories.length - 1 && <span className="comma">,</span>}
              </span>
            ))}
          </>
        )}
      </div>
      <ul className="index-list">
        {filtered.map((project) => (
          <li key={project._id} className="index-list-item">
            <Link href={`/#${project.slug}`} className="index-project-link">
              <div className="index-project-title">
                <span className="index-project-title-inner">{project.title}</span>
              </div>
              {Array.isArray(project.categories) &&
              project.categories.length > 0 ? (
                <TickerCell className="index-project-categories">
                  {project.categories
                    .filter(Boolean)
                    .map((c) => (c as IndexCategory).title)
                    .join(', ')}
                </TickerCell>
              ) : (
                <span className="index-project-categories index-project-cell-empty" />
              )}
              {project.year && (
                <span className="index-project-year">{project.year}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
