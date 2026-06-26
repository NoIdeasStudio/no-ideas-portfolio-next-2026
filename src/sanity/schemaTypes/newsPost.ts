import { defineArrayMember, defineField, defineType } from 'sanity'
import { linkableBlockMember } from './linkableBlock'
import { portableTextPlain } from '../lib/portableTextPlain'
import { newsMediaItemObject } from './newsMediaItem'

export const newsPostObject = defineType({
  name: 'newsPost',
  type: 'object',
  title: 'Post',
  fields: [
    defineField({
      name: 'aspectRatio',
      type: 'string',
      title: 'Media aspect ratio',
      description:
        'Native uses the media’s natural height. Square and 3:4 crop with object-fit: cover.',
      options: {
        list: [
          { title: 'Native (natural height)', value: 'native' },
          { title: '1:1 (cover crop)', value: 'square' },
          { title: '3:4 (cover crop)', value: '3:4' },
        ],
        layout: 'radio',
      },
      initialValue: 'native',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'limitViewportHeight',
      type: 'boolean',
      title: 'Limit to viewport height (desktop)',
      description:
        'On desktop, sets the slideshow maximum height to 100% of the viewport. Shorter media keeps its natural height. Mobile is unchanged.',
      initialValue: false,
    }),
    defineField({
      name: 'sidePadding',
      type: 'boolean',
      title: 'Side padding (15%, desktop)',
      description: 'On desktop, adds 15% padding to the left and right of the post.',
      initialValue: false,
    }),
    defineField({
      name: 'slides',
      type: 'array',
      title: 'Slideshow',
      description: 'Add multiple items for a slideshow. Click left/right to navigate.',
      of: [defineArrayMember({ type: newsMediaItemObject.name })],
      validation: (Rule) => Rule.min(1).error('At least one slide is required'),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Timestamp',
      description: 'Displayed below the media (Eastern Time).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'array',
      title: 'Description',
      description: 'Plain text and URL links only.',
      of: [linkableBlockMember],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      description: 'description',
      publishedAt: 'publishedAt',
      media: 'slides.0.image',
    },
    prepare({ description, publishedAt, media }) {
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString('en-US', { timeZone: 'America/New_York' })
        : 'No date'
      const plain =
        typeof description === 'string'
          ? description
          : portableTextPlain(description)
      return {
        title: plain ? plain.slice(0, 60) : 'Post',
        subtitle: date,
        media,
      }
    },
  },
})
