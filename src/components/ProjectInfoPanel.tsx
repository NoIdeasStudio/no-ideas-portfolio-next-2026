'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
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

function hasPortableText(value?: PortableTextBlock[] | string | null) {
  if (Array.isArray(value)) return value.length > 0
  return typeof value === 'string' && value.trim().length > 0
}

function DescriptionText({
  description,
  expanded,
  showMore,
  onMore,
  onLess,
}: {
  description: PortableTextBlock[] | string
  expanded: boolean
  showMore: boolean
  onMore: () => void
  onLess: () => void
}) {
  if (Array.isArray(description)) {
    return (
      <div
        className={
          expanded ? 'project-info-description' : 'project-info-description project-info-description--clamped'
        }
      >
        <PortableText value={description} components={portableTextComponents} />
        {!expanded && showMore && (
          <button type="button" className="project-info-inline-action" onClick={onMore}>
            More
          </button>
        )}
        {expanded && (
          <button type="button" className="project-info-inline-action" onClick={onLess}>
            Less
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={
        expanded ? 'project-info-description' : 'project-info-description project-info-description--clamped'
      }
    >
      <p className="project-info-para">{description}</p>
      {!expanded && showMore && (
        <button type="button" className="project-info-inline-action" onClick={onMore}>
          More
        </button>
      )}
      {expanded && (
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
  const services = categories.map((c) => c.title).join(', ')

  return (
    <div className="project-info-meta">
      {services && (
        <div className="project-info-meta-block">
          <h3 className="project-info-meta-heading">Services</h3>
          <p className="project-info-meta-text">{services}</p>
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
  categories?: ProjectCategory[]
  year?: string | null
  visitUrl?: string | null
  recognition?: PortableTextBlock[] | null
  credits?: PortableTextBlock[] | null
  isOpen: boolean
  isExpanded: boolean
  onClose: () => void
  onExpand: () => void
  onCollapse: () => void
}

export function ProjectInfoPanel({
  projectSlug,
  description,
  categories = [],
  year,
  visitUrl,
  recognition,
  credits,
  isOpen,
  isExpanded,
  onClose,
  onExpand,
  onCollapse,
}: ProjectInfoPanelProps) {
  const autoScroll = useAutoScroll()
  const [isClosing, setIsClosing] = useState(false)

  const handleLess = useCallback(() => {
    setIsClosing(true)
  }, [])

  useEffect(() => {
    if (isExpanded) setIsClosing(false)
  }, [isExpanded])

  useEffect(() => {
    if (!isClosing) return
    const timer = window.setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 350)
    return () => window.clearTimeout(timer)
  }, [isClosing, onClose])

  const hasExpandableContent =
    hasPortableText(description) &&
    (Array.isArray(description)
      ? description.length > 1 ||
        JSON.stringify(description).length > 280 ||
        !!visitUrl ||
        hasPortableText(recognition) ||
        hasPortableText(credits)
      : typeof description === 'string' && description.length > 280 ||
        !!visitUrl ||
        hasPortableText(recognition) ||
        hasPortableText(credits))

  useEffect(() => {
    if (!isExpanded && !isClosing) return

    autoScroll?.setScrollLocked(true)
    const scrollY = window.scrollY
    const { style } = document.body
    style.position = 'fixed'
    style.top = `-${scrollY}px`
    style.left = '0'
    style.right = '0'
    style.overflow = 'hidden'
    style.width = '100%'

    return () => {
      autoScroll?.setScrollLocked(false)
      style.position = ''
      style.top = ''
      style.left = ''
      style.right = ''
      style.overflow = ''
      style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [isExpanded, isClosing, autoScroll])

  if (!isOpen || !hasPortableText(description)) return null

  const descriptionContent = description as PortableTextBlock[] | string
  const panelId = `project-info-${projectSlug}`

  if (isExpanded || isClosing) {
    return (
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
              <DescriptionText
                description={descriptionContent}
                expanded
                showMore={false}
                onMore={onExpand}
                onLess={handleLess}
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
            <DescriptionText
              description={descriptionContent}
              expanded={false}
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
