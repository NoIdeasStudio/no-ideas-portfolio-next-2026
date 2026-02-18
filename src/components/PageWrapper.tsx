'use client'

import { usePathname } from 'next/navigation'

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const id =
    pathname === '/'
      ? 'homepage'
      : pathname === '/info'
        ? 'info'
        : pathname === '/index'
          ? 'index'
          : undefined
  return (
    <div className="min-h-screen flex flex-col" id={id}>
      {children}
    </div>
  )
}
