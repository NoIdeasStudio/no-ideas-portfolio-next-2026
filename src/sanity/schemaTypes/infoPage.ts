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
      of: [defineArrayMember({ type: 'introParagraph' })],
    }),
    defineField({
      name: 'sections',
      type: 'array',
      title: 'Sections',
      description: 'Add, remove, or reorder sections (List, Contact, Columns).',
      of: [defineArrayMember({ type: infoSectionObject.name })],
    }),
    defineField({
      name: 'seo',
      type: 'seo',
      title: 'SEO',
      description: 'Optional overrides for search and social previews on the Info page.',
    }),
    defineField({
      name: 'newsSection',
      type: 'object',
      title: 'News',
      description: 'News posts shown below the footer on the info page.',
      fields: [
        defineField({
          name: 'title',
          type: 'string',
          title: 'Section title',
          initialValue: 'News',
        }),
        defineField({
          name: 'rows',
          type: 'array',
          title: 'Rows',
          description: 'Each row is full width (1 post) or half width (1–2 posts side by side).',
          of: [defineArrayMember({ type: 'newsRow' })],
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Info Page' }
    },
  },
})
