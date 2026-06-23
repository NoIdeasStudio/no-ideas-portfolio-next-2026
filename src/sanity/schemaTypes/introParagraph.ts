import { defineField, defineType } from 'sanity'
import { linkableBlockMember } from './linkableBlock'

export const introParagraphObject = defineType({
  name: 'introParagraph',
  type: 'object',
  title: 'Intro paragraph',
  fields: [
    defineField({
      name: 'content',
      type: 'array',
      title: 'Paragraph',
      validation: (Rule) => Rule.required(),
      of: [linkableBlockMember],
    }),
  ],
  preview: {
    select: { content: 'content' },
    prepare({ content }) {
      const block = Array.isArray(content)
        ? content.find((b: { _type?: string }) => b?._type === 'block')
        : null
      const text =
        block && 'children' in block
          ? (block.children as { text?: string }[]).map((c) => c.text).join('')
          : ''
      const excerpt = typeof text === 'string' ? text.slice(0, 60) : ''
      return { title: excerpt ? `${excerpt}${excerpt.length >= 60 ? '…' : ''}` : 'Paragraph' }
    },
  },
})
