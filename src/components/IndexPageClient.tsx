'use client'

import Link from 'next/link'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

const PROJECTS_VIEW_STORAGE_KEY = 'projects-view-mode'

function IndexGridCell({
  item,
  onShowTooltip,
  onUpdateTooltip,
  onHideTooltip,
}: {
  item: IndexGridItem
  onShowTooltip: (e: React.MouseEvent, text: string) => void
  onUpdateTooltip: (e: React.MouseEvent) => void
  onHideTooltip: () => void
}) {
  const [loaded, setLoaded] = useState(false)
  const isVideo = item.mediaType === 'video' && item.videoUrl
  const isImage = item.mediaType === 'image' || !isVideo

  return (
    <Link
      href={`/#${item.projectSlug}`}
      className={`index-grid-item ${loaded ? 'loaded' : ''}`}
      onMouseEnter={(e) => onShowTooltip(e, item.projectTitle)}
      onMouseMove={onUpdateTooltip}
      onMouseLeave={onHideTooltip}
    >
      {isVideo && item.videoUrl ? (
        <video
          src={item.videoUrl}
          className="index-grid-media"
          playsInline
          muted
          loop
          onLoadedData={() => setLoaded(true)}
        />
      ) : isImage && item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt=""
          className="index-grid-media"
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
      ) : null}
    </Link>
  )
}

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

/** One image or video slot for the grid view (flattened from all projects' slides). */
export type IndexGridItem = {
  projectSlug: string
  projectTitle: string
  mediaType: 'image' | 'video'
  imageUrl: string | null
  videoUrl: string | null
  fit?: 'cover' | 'contain'
}

type IndexPageClientProps = {
  categories: IndexCategory[]
  projects: IndexProject[]
  gridItems?: IndexGridItem[]
}

export function IndexPageClient({
  categories,
  projects,
  gridItems = [],
}: IndexPageClientProps) {
  const [filter, setFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [tooltip, setTooltip] = useState<{
    show: boolean
    x: number
    y: number
    text: string
  }>({ show: false, x: 0, y: 0, text: '' })

  useEffect(() => {
    const saved = window.localStorage.getItem(PROJECTS_VIEW_STORAGE_KEY)
    if (saved === 'grid' || saved === 'list') setViewMode(saved)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(PROJECTS_VIEW_STORAGE_KEY, viewMode)
  }, [viewMode])

  const filtered = useMemo(() => {
    if (filter === 'all') return projects
    return projects.filter(
      (p) =>
        Array.isArray(p.categories) &&
        p.categories.some((c) => c && c._id === filter)
    )
  }, [projects, filter])

  const filteredGridItems = useMemo(() => {
    const slugs = new Set(filtered.map((p) => p.slug))
    return gridItems.filter((item) => slugs.has(item.projectSlug))
  }, [gridItems, filtered])

  const showTooltip = (e: React.MouseEvent, text: string) => {
    setTooltip({ show: true, x: e.clientX, y: e.clientY, text })
  }
  const updateTooltip = (e: React.MouseEvent) => {
    setTooltip((t) => (t.show ? { ...t, x: e.clientX, y: e.clientY } : t))
  }
  const hideTooltip = () => {
    setTooltip((t) => ({ ...t, show: false }))
  }

  return (
    <div className="index type-size-1">
      <div className="index-filters">
        <div className="index-filters-left">
          <div className="index-filters-scroll">
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
                  <span key={cat._id} className="index-filter-chunk">
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
        </div>
        <div className="index-view-toggle">
          <button
            type="button"
            className={`index-filter ${viewMode === 'list' ? 'selected' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
          <span className="comma">,</span>{' '}
          <button
            type="button"
            className={`index-filter ${viewMode === 'grid' ? 'selected' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
        </div>
      </div>
      {viewMode === 'list' && (
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
      )}
      {viewMode === 'grid' && (
        <div className="index-grid">
          {filteredGridItems.map((item, i) => (
            <IndexGridCell
              key={`${item.projectSlug}-${i}`}
              item={item}
              onShowTooltip={showTooltip}
              onUpdateTooltip={updateTooltip}
              onHideTooltip={hideTooltip}
            />
          ))}
        </div>
      )}
      {tooltip.show && (
        <div
          className="index-grid-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
          aria-hidden
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
