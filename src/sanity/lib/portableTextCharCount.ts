type PortableTextSpan = { _type?: string; text?: string }

type PortableTextBlock = {
  _type?: string
  children?: PortableTextSpan[]
}

/** Count plain-text characters across portable text blocks (links excluded). */
export function portableTextCharCount(value: unknown): number {
  if (!Array.isArray(value)) return 0
  return (value as PortableTextBlock[]).reduce((total, block) => {
    if (block?._type !== 'block' || !Array.isArray(block.children)) return total
    return (
      total +
      block.children.reduce((sum, child) => {
        if (child?._type !== 'span') return sum
        return sum + (child.text?.length ?? 0)
      }, 0)
    )
  }, 0)
}
