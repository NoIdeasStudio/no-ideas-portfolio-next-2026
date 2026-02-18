'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProjectTheme } from '../contexts/ProjectThemeContext'

export function Header() {
  const pathname = usePathname()
  const projectTheme = useProjectTheme()
  const headerColor =
    pathname === '/' && projectTheme?.themeColor != null
      ? projectTheme.themeColor
      : undefined

  return (
    <header
      className={`type-size-1${headerColor ? ' header-theme-override' : ''}`}
      style={headerColor ? { color: headerColor } : undefined}
    >
      <div>
        <Link href="/" className={pathname === '/' ? 'selected' : ''}>
          No Ideas
        </Link>
      </div>
      <div className="header-links">
        <Link href="/info" className={pathname === '/info' ? 'selected' : ''}>
          Info
        </Link>
        <span className="comma">,</span>{' '}
        <Link href="/index" className={pathname === '/index' ? 'selected' : ''}>
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
