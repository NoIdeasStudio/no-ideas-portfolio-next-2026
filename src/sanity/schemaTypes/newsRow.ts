import { defineArrayMember, defineField, defineType } from 'sanity'
import { newsPostObject } from './newsPost'

export const newsRowObject = defineType({
  name: 'newsRow',
  type: 'object',
  title: 'Row',
  fields: [
    defineField({
      name: 'layout',
      type: 'string',
      title: 'Layout',
      options: {
        list: [
          { title: 'Full width (1 post)', value: 'full' },
          { title: 'Half width (1–2 posts side by side)', value: 'half' },
        ],
        layout: 'radio',
      },
      initialValue: 'full',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'posts',
      type: 'array',
      title: 'Posts',
      of: [defineArrayMember({ type: newsPostObject.name })],
      validation: (Rule) =>
        Rule.custom((posts, context) => {
          const parent = context.parent as { layout?: string } | undefined
          const count = Array.isArray(posts) ? posts.length : 0
          if (parent?.layout === 'half') {
            return count >= 1 && count <= 2
              ? true
              : 'Half-width rows need 1 or 2 posts'
          }
          return count === 1 ? true : 'Full-width rows need exactly 1 post'
        }),
    }),
  ],
  preview: {
    select: {
      layout: 'layout',
      posts: 'posts',
    },
    prepare({ layout, posts }) {
      const count = Array.isArray(posts) ? posts.length : 0
      const layoutLabel =
        layout === 'half' ? (count === 1 ? 'Half width (1 post)' : '2 columns') : 'Full width'
      return {
        title: layoutLabel,
        subtitle: `${count} post${count === 1 ? '' : 's'}`,
      }
    },
  },
})
