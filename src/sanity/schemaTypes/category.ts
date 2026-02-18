import { defineField, defineType } from 'sanity'

/** Reusable category/tag for the Index page. Create once, then assign to projects. */
export const categoryType = defineType({
  name: 'category',
  type: 'document',
  title: 'Category',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'Display name (e.g. Art Direction, Identity). Shown in Index filter and on project rows.',
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
      name: 'sortOrder',
      type: 'number',
      title: 'Sort order',
      description: 'Lower numbers appear first in the Index filter list. Leave blank to sort by title.',
    }),
  ],
  orderings: [
    { title: 'Filter order (sort order)', name: 'sortOrderAsc', by: [{ field: 'sortOrder', direction: 'asc' }] },
    { title: 'Title A–Z', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return { title: title || 'Category' }
    },
  },
})
