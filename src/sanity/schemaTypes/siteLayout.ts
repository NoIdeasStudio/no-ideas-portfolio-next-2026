import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Singleton: controls display order of projects (homepage + projects page)
 * and categories (projects page filter). Drag and drop to reorder.
 */
export const siteLayoutType = defineType({
  name: 'siteLayout',
  type: 'document',
  title: 'Site Layout',
  description:
    'Order of projects on the homepage and projects page, and order of categories in the projects page filter. Drag to reorder.',
  fields: [
    defineField({
      name: 'projectOrder',
      type: 'array',
      title: 'Project order',
      description:
        'Drag to reorder. Top item is first on the homepage and projects page. Only published projects appear on the site. When adding, only projects not already in the list are shown.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'project' }],
          options: {
            filter: ({ document }) => {
              const order = document?.projectOrder
              const refs = (Array.isArray(order) ? order : [])
                .map((item: { _ref?: string }) => item?._ref)
                .filter(Boolean) as string[]
              return {
                filter: refs.length > 0 ? '!(_id in $refs)' : undefined,
                params: { refs },
              }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'categoryOrder',
      type: 'array',
      title: 'Category order',
      description:
        'Drag to reorder. This order is used for the filter list on the projects page. When adding, only categories not already in the list are shown.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'category' }],
          options: {
            filter: ({ document }) => {
              const order = document?.categoryOrder
              const refs = (Array.isArray(order) ? order : [])
                .map((item: { _ref?: string }) => item?._ref)
                .filter(Boolean) as string[]
              return {
                filter: refs.length > 0 ? '!(_id in $refs)' : undefined,
                params: { refs },
              }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.unique(),
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Layout' }
    },
  },
})
