'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProjectTheme } from '../contexts/ProjectThemeContext'
import { useIsHomepage } from '../lib/useIsHomepage'

export function Header() {
  const pathname = usePathname()
  const isHomepage = useIsHomepage()
  const projectTheme = useProjectTheme()
  const showProjectTitle =
    isHomepage &&
    projectTheme?.activeProjectSlug != null &&
    projectTheme?.activeProjectTitle != null
  const headerColor =
    isHomepage && projectTheme?.infoExpandedSlug
      ? '#000'
      : isHomepage && projectTheme?.themeColor != null
        ? projectTheme.themeColor
        : undefined

  return (
    <header
      className={`type-primary${headerColor ? ' header-theme-override' : ''}${projectTheme?.infoExpandedSlug ? ' header-info-expanded' : ''}`}
      style={{
        ...(headerColor ? { color: headerColor } : {}),
        ...(projectTheme?.infoExpandedSlug ? { zIndex: 50 } : {}),
      }}
    >
      <div className="header-left">
        <Link href="/" className={isHomepage ? 'selected' : ''}>
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
