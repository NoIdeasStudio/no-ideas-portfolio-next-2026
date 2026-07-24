'use client'

import { usePathname } from 'next/navigation'
import { useIsHomepage } from '../lib/useIsHomepage'

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomepage = useIsHomepage()
  const id = isHomepage
    ? 'homepage'
    : pathname === '/info'
      ? 'info'
      : pathname === '/projects'
        ? 'index'
        : undefined
  return (
    <div className="min-h-screen flex flex-col" id={id}>
      {children}
    </div>
  )
}
