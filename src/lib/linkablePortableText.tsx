import type { ReactNode } from 'react'

/** Portable Text renderers for plain paragraphs with URL links (project info, news, etc.). */
export const linkablePortableTextComponents = {
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
