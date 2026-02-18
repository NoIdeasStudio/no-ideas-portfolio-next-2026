import { defineArrayMember, defineField, defineType } from 'sanity'
import { infoSectionObject } from './infoSection'

/** Info page: intro paragraphs (rich text with links) + sections. Single document for /info. */
export const infoPageType = defineType({
  name: 'infoPage',
  type: 'document',
  title: 'Info Page',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Page title',
      description: 'Used in Studio only (e.g. "Info").',
      initialValue: 'Info',
      readOnly: true,
      hidden: () => true,
    }),
    defineField({
      name: 'introParagraphs',
      type: 'array',
      title: 'Intro paragraphs',
      description: 'Add or remove paragraphs. Each paragraph supports links. New paragraphs are indented.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'introParagraph',
          fields: [
            {
              name: 'content',
              type: 'array',
              title: 'Paragraph',
              validation: (Rule) => Rule.required(),
              of: [
                defineArrayMember({
                  type: 'block',
                  marks: {
                    annotations: [
                      {
                        name: 'link',
                        type: 'object',
                        title: 'URL',
                        fields: [
                          { name: 'href', type: 'url', title: 'URL' },
                          {
                            name: 'blank',
                            type: 'boolean',
                            title: 'Open in new tab',
                            initialValue: true,
                          },
                        ],
                      },
                    ],
                  },
                }),
              ],
            },
          ],
          preview: {
            select: { content: 'content' },
            prepare({ content }) {
              const block = Array.isArray(content) ? content.find((b: { _type?: string }) => b?._type === 'block') : null
              const text = block && 'children' in block ? (block.children as { text?: string }[]).map((c) => c.text).join('') : ''
              const excerpt = typeof text === 'string' ? text.slice(0, 60) : ''
              return { title: excerpt ? `${excerpt}${excerpt.length >= 60 ? '…' : ''}` : 'Paragraph' }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'sections',
      type: 'array',
      title: 'Sections',
      description: 'Add, remove, or reorder sections (List, Contact, Columns).',
      of: [defineArrayMember({ type: infoSectionObject.name })],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Info Page' }
    },
  },
})
