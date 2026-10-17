import { defineArrayMember, defineField, defineType } from 'sanity'
import { BookIcon } from '@sanity/icons'

/** Singleton: index label for the book slideshow, and its sequence. */
export const bookOrderType = defineType({
  name: 'bookOrder',
  type: 'document',
  title: 'Slideshow order',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'Name shown for the book slideshow on the projects index.',
      initialValue: 'Book Covers',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'categories',
      type: 'array',
      title: 'Categories',
      description:
        'Tags for the projects index. Create categories in Categories, then add them here. When adding, only categories not already selected are shown.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'category' }],
          options: {
            filter: ({ document }) => {
              const selected = document?.categories
              const refs = (Array.isArray(selected) ? selected : [])
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
      name: 'year',
      type: 'string',
      title: 'Year',
      description: 'Display year for the projects index (e.g. 2026).',
    }),
    defineField({
      name: 'books',
      type: 'array',
      title: 'Books',
      description:
        'Drag to set the sequence in the slideshow. Remove a book from this list to take it off the site. When adding, only books not already in the list are shown.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'book' }],
          options: {
            filter: ({ document }) => {
              const order = document?.books
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
      return { title: 'Slideshow order' }
    },
  },
})
