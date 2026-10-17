import { defineField, defineType } from 'sanity'
import { BookIcon } from '@sanity/icons'
import { books } from '../../data/books'

const plateNote =
  'A replacement has to be the same spread as the current plate. The mapping in code places the art on the boards, so a different crop will sit in the wrong place.'

const maskNote = `${plateNote} This plate is a mask aligned to that same spread.`

/** A book that already has a 3D build in code. Copy and plates can change here. */
export const bookType = defineType({
  name: 'book',
  type: 'document',
  title: 'Book',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Info description',
      rows: 3,
      description: 'Copy for the cover info panel.',
    }),
    defineField({
      name: 'slug',
      type: 'string',
      title: 'Built book',
      description: 'Which book this document controls. Binding, size, and spread mapping stay in code.',
      options: {
        list: books.map((book) => ({ title: book.title, value: book.slug })),
      },
      validation: (Rule) =>
        Rule.required().custom(async (slug, context) => {
          if (!slug) return true
          const client = context.getClient({ apiVersion: '2025-02-19' })
          const id = context.document?._id?.replace(/^drafts\./, '')
          const count = await client.fetch<number>(
            `count(*[_type == "book" && slug == $slug && !(_id in [$id, $draftId])])`,
            { slug, id, draftId: id ? `drafts.${id}` : '' },
          )
          return count === 0 ? true : 'A book with this built book already exists'
        }),
    }),
    defineField({
      name: 'cover',
      type: 'image',
      title: 'Cover',
      description: plateNote,
    }),
    defineField({
      name: 'varnish',
      type: 'image',
      title: 'Varnish',
      description: maskNote,
    }),
    defineField({
      name: 'foil',
      type: 'image',
      title: 'Foil',
      description: maskNote,
    }),
    defineField({
      name: 'deboss',
      type: 'image',
      title: 'Deboss',
      description: maskNote,
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return { title: title || 'Book' }
    },
  },
})
