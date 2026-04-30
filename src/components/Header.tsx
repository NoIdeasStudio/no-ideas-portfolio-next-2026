'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProjectTheme } from '../contexts/ProjectThemeContext'

export function Header() {
  const pathname = usePathname()
  const projectTheme = useProjectTheme()
  const isHomepage = pathname === '/'
  const showProjectTitle =
    isHomepage &&
    projectTheme?.activeProjectSlug != null &&
    projectTheme?.activeProjectTitle != null
  const headerColor =
    isHomepage && projectTheme?.themeColor != null
      ? projectTheme.themeColor
      : undefined

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
            <span className="header-project-title font-medium">
              {projectTheme?.activeProjectTitle}
            </span>
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
