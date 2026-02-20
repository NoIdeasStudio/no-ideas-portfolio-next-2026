'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProjectTheme } from '../contexts/ProjectThemeContext'
import { useAutoScroll } from '../contexts/AutoScrollContext'

export function Header() {
  const pathname = usePathname()
  const projectTheme = useProjectTheme()
  const autoScroll = useAutoScroll()
  const isHomepage = pathname === '/'
  const showProjectTitle =
    isHomepage &&
    projectTheme?.activeProjectSlug != null &&
    projectTheme?.activeProjectTitle != null
  const headerColor =
    isHomepage && projectTheme?.themeColor != null
      ? projectTheme.themeColor
      : undefined

  const handleTitleClick = () => {
    if (!projectTheme?.activeProjectSlug) return
    projectTheme.setDescriptionOpenSlug(
      projectTheme.descriptionOpenSlug === projectTheme.activeProjectSlug
        ? null
        : projectTheme.activeProjectSlug
    )
    // Soft-scroll project to top and pause auto-scroll (same as carousel interaction)
    autoScroll?.onCarouselInteraction(projectTheme.activeProjectSlug)
  }

  return (
    <header
      className={`type-size-1${headerColor ? ' header-theme-override' : ''}`}
      style={headerColor ? { color: headerColor } : undefined}
    >
      <div className="header-left">
        <Link href="/" className={pathname === '/' ? 'selected' : ''}>
          No Ideas
        </Link>
        {showProjectTitle && (
          <>
            {' '}
            <button
              type="button"
              onClick={handleTitleClick}
              className={`header-project-title font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 ${projectTheme?.descriptionOpenSlug === projectTheme?.activeProjectSlug ? 'header-project-title-open' : ''}`.trim()}
            >
              {projectTheme?.activeProjectTitle}
            </button>
          </>
        )}
      </div>
      <div className="header-links">
        <Link href="/info" className={pathname === '/info' ? 'selected' : ''}>
          Info
        </Link>
        <span className="comma">,</span>{' '}
        <Link href="/projects" className={pathname === '/projects' ? 'selected' : ''}>
          Index
        </Link>
        <span className="comma">,</span>{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.bookideas.website/"
        >
          Shop
        </a>
      </div>
    </header>
  )
}
