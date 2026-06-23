'use client'

import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { PortableText } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/types'
import { useAutoScroll } from '../contexts/AutoScrollContext'

export type ProjectCategory = {
  _id: string
  title: string
  slug: string
}

const portableTextComponents = {
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p className="project-info-para">{children}</p>
    ),
  },
  marks: {
    link: ({
      value,
      children,
    }: {
      value?: { href?: string; blank?: boolean }
      children?: ReactNode
    }) => (
      <a
        href={value?.href}
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
        className="project-info-text-link"
      >
        {children}
      </a>
    ),
  },
}

function formatVisitLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function hasPortableText(value?: PortableTextBlock[] | string | null) {
  if (Array.isArray(value)) return value.length > 0
  return typeof value === 'string' && value.trim().length > 0
}

function DescriptionContent({
  description,
  extendedDescription,
  expanded,
  showExtended,
  showMore,
  onMore,
  onLess,
}: {
  description?: PortableTextBlock[] | string | null
  extendedDescription?: PortableTextBlock[] | null
  expanded: boolean
  showExtended: boolean
  showMore: boolean
  onMore: () => void
  onLess: () => void
}) {
  const shortDescription = hasPortableText(description) ? (
    Array.isArray(description) ? (
      <PortableText value={description} components={portableTextComponents} />
    ) : (
      <p className="project-info-para">{description}</p>
    )
  ) : null

  if (!expanded && showMore) {
    return (
      <div className="project-info-description project-info-description--with-more">
        {shortDescription}
        <button type="button" className="project-info-inline-action" onClick={onMore}>
          More
        </button>
      </div>
    )
  }

  return (
    <div className="project-info-description">
      {shortDescription}
      {showExtended && hasPortableText(extendedDescription) && (
        <div className="project-info-extended project-info-description--with-more">
          <PortableText value={extendedDescription!} components={portableTextComponents} />
          {expanded && (
            <button type="button" className="project-info-inline-action" onClick={onLess}>
              Less
            </button>
          )}
        </div>
      )}
      {expanded && !hasPortableText(extendedDescription) && (
        <button type="button" className="project-info-inline-action" onClick={onLess}>
          Less
        </button>
      )}
    </div>
  )
}

function MetaColumn({
  categories,
  year,
  visitUrl,
  recognition,
  credits,
  expanded,
}: {
  categories: ProjectCategory[]
  year?: string | null
  visitUrl?: string | null
  recognition?: PortableTextBlock[] | null
  credits?: PortableTextBlock[] | null
  expanded: boolean
}) {
  return (
    <div className="project-info-meta">
      {categories.length > 0 && (
        <div className="project-info-meta-block">
          <h3 className="project-info-meta-heading">Services</h3>
          <p className="project-info-meta-text">
            {categories.map((cat, i) => (
              <span key={cat._id}>
                {i > 0 && ', '}
                <Link
                  href={`/projects?category=${encodeURIComponent(cat.slug)}`}
                  className="project-info-text-link"
                >
                  {cat.title}
                </Link>
              </span>
            ))}
          </p>
        </div>
      )}
      {year && (
        <div className="project-info-meta-block">
          <h3 className="project-info-meta-heading">Year</h3>
          <p className="project-info-meta-text">{year}</p>
        </div>
      )}
      {expanded && visitUrl && (
        <div className="project-info-meta-block">
          <h3 className="project-info-meta-heading">Visit</h3>
          <p className="project-info-meta-text">
            <a
              href={visitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-info-text-link"
            >
              {formatVisitLabel(visitUrl)}
            </a>
          </p>
        </div>
      )}
      {expanded && hasPortableText(recognition) && (
        <div className="project-info-meta-block">
          <h3 className="project-info-meta-heading">Recognition</h3>
          <div className="project-info-meta-text">
            <PortableText value={recognition!} components={portableTextComponents} />
          </div>
        </div>
      )}
      {expanded && hasPortableText(credits) && (
        <div className="project-info-meta-block">
          <h3 className="project-info-meta-heading">Credits</h3>
          <div className="project-info-meta-text">
            <PortableText value={credits!} components={portableTextComponents} />
          </div>
        </div>
      )}
    </div>
  )
}

type ProjectInfoPanelProps = {
  projectSlug: string
  description?: PortableTextBlock[] | string | null
  extendedDescription?: PortableTextBlock[] | null
  categories?: ProjectCategory[]
  year?: string | null
  visitUrl?: string | null
  recognition?: PortableTextBlock[] | null
  credits?: PortableTextBlock[] | null
  isOpen: boolean
  isExpanded: boolean
  isClosing: boolean
  onLess: () => void
  onClose: () => void
  onExpand: () => void
  onCollapse: () => void
}

export function ProjectInfoPanel({
  projectSlug,
  description,
  extendedDescription,
  categories = [],
  year,
  visitUrl,
  recognition,
  credits,
  isOpen,
  isExpanded,
  isClosing,
  onLess,
  onClose,
  onExpand,
  onCollapse,
}: ProjectInfoPanelProps) {
  const autoScroll = useAutoScroll()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isClosing) return
    const timer = window.setTimeout(() => {
      onClose()
    }, 350)
    return () => window.clearTimeout(timer)
  }, [isClosing, onClose])

  const hasExpandableContent =
    hasPortableText(extendedDescription) ||
    !!visitUrl ||
    hasPortableText(recognition) ||
    hasPortableText(credits)

  const hasInfoContent =
    hasPortableText(description) || hasPortableText(extendedDescription)

  useEffect(() => {
    if (!isExpanded && !isClosing) return

    autoScroll?.setScrollLocked(true)
    const html = document.documentElement
    const body = document.body
    const scrollY = window.scrollY

    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    const prevBodyTouchAction = body.style.touchAction

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.touchAction = 'none'

    return () => {
      autoScroll?.setScrollLocked(false)
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      body.style.touchAction = prevBodyTouchAction
      window.scrollTo(0, scrollY)
    }
  }, [isExpanded, isClosing, autoScroll])

  if (!isOpen || !hasInfoContent) return null

  const panelId = `project-info-${projectSlug}`

  if (isExpanded || isClosing) {
    const fullPanel = (
      <div
        id={panelId}
        className={`project-info-full${isClosing ? ' project-info-full--out' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Project information"
      >
        <div className="project-info-full-scroll">
          <div className="project-info-columns">
            <div className="project-info-main">
              <h2 className="project-info-heading">Info</h2>
              <DescriptionContent
                description={description}
                extendedDescription={extendedDescription}
                expanded
                showExtended
                showMore={false}
                onMore={onExpand}
                onLess={onLess}
              />
            </div>
            <MetaColumn
              categories={categories}
              year={year}
              visitUrl={visitUrl}
              recognition={recognition}
              credits={credits}
              expanded
            />
          </div>
        </div>
      </div>
    )

    return mounted ? createPortal(fullPanel, document.body) : null
  }

  return (
    <div className="project-info-layer" role="dialog" aria-modal="false" aria-label="Project information">
      <button
        type="button"
        className="project-info-backdrop"
        onClick={onClose}
        aria-label="Close project information"
      />
      <div id={panelId} className="project-info-half" onClick={(e) => e.stopPropagation()}>
        <div className="project-info-columns">
          <div className="project-info-main">
            <h2 className="project-info-heading">Info</h2>
            <DescriptionContent
              description={description}
              extendedDescription={extendedDescription}
              expanded={false}
              showExtended={false}
              showMore={hasExpandableContent}
              onMore={onExpand}
              onLess={onCollapse}
            />
          </div>
          <MetaColumn
            categories={categories}
            year={year}
            visitUrl={visitUrl}
            recognition={recognition}
            credits={credits}
            expanded={false}
          />
        </div>
      </div>
    </div>
  )
}
