type PortableTextSpan = { _type?: string; text?: string }

type PortableTextBlock = {
  _type?: string
  children?: PortableTextSpan[]
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
