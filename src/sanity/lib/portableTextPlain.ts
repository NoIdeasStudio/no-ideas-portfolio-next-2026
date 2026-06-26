import type { PortableTextBlock as SanityPortableTextBlock } from '@portabletext/types'

type PortableTextSpan = { _type?: string; text?: string }

type PortableTextBlock = {
  _type?: string
  children?: PortableTextSpan[]
}

export function hasPortableText(value?: SanityPortableTextBlock[] | string | null) {
  if (Array.isArray(value)) return value.length > 0
  return typeof value === 'string' && value.trim().length > 0
}

/** Plain text from portable text blocks (link annotations excluded). */
export function portableTextPlain(value: unknown): string {
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return ''
  return (value as PortableTextBlock[])
    .map((block) => {
      if (block?._type !== 'block' || !Array.isArray(block.children)) return ''
      return block.children
        .map((child) => (child?._type === 'span' ? child.text ?? '' : ''))
        .join('')
    })
    .join('\n')
    .trim()
}
