import { defineArrayMember, defineField, defineType } from 'sanity'

/** Portfolio project: a full-viewport slideshow of slides. */
export const projectType = defineType({
  name: 'project',
  type: 'document',
  title: 'Project',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'categories',
      type: 'array',
      title: 'Categories',
      description: 'Tags for the Index page. Create categories in Categories, then add them here.',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({
      name: 'year',
      type: 'string',
      title: 'Year',
      description: 'Display year for the Index page (e.g. 2025).',
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      description: 'Shown when the project name is clicked on the slideshow (bottom left).',
      rows: 4,
    }),
    defineField({
      name: 'textTheme',
      type: 'string',
      title: 'Text & header color',
      description: 'Color for header, project title, description and slide numbers when this project is in view. Defaults to white.',
      options: {
        list: [
          { title: 'Light (#fff)', value: 'light' },
          { title: 'Dark (#000)', value: 'dark' },
          { title: 'Custom', value: 'custom' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'textThemeCustomColor',
      type: 'string',
      title: 'Custom color (hex)',
      description: 'Used when Text & header color is Custom (e.g. #fff or #333).',
      hidden: ({ parent }) => parent?.textTheme !== 'custom',
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          if (ctx?.parent?.textTheme !== 'custom') return true
          if (!value) return 'Required when using Custom.'
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) ? true : 'Enter a valid hex (e.g. #fff or #333).'
        }),
    }),
    defineField({
      name: 'slides',
      type: 'array',
      title: 'Slides',
      of: [defineArrayMember({ type: 'slide' })],
      description: 'Slides shown in order. Each slide can be full bleed or contain, with image or video.',
    }),
  ],
  preview: {
    select: { title: 'title', count: 'slides' },
    prepare({ title, count }) {
      const n = Array.isArray(count) ? count.length : 0
      return {
        title: title || 'Untitled project',
        subtitle: n === 0 ? 'No slides' : `${n} slide${n === 1 ? '' : 's'}`,
      }
    },
  },
})
