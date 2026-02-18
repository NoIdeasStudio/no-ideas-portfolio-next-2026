import { defineArrayMember, defineField, defineType } from 'sanity'

/** Reusable slide block: layout + image or video (URL for now; MUX later). */
export const slideObject = defineType({
  name: 'slide',
  type: 'object',
  title: 'Slide',
  fields: [
    defineField({
      name: 'layout',
      type: 'string',
      title: 'Layout',
      options: {
        list: [
          { title: 'Full bleed', value: 'fullBleed' },
          { title: 'Contain', value: 'contain' },
          { title: '2-up (two images side by side)', value: 'twoUp' },
        ],
        layout: 'radio',
      },
      initialValue: 'fullBleed',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'containPadding',
      type: 'string',
      title: 'Padding (contain only)',
      description: 'Padding applied to all sides of the media when layout is Contain.',
      hidden: ({ parent }) => parent?.layout !== 'contain',
      options: {
        list: [
          { title: 'None (0%)', value: '0' },
          { title: 'Small (2%)', value: '2' },
          { title: 'Medium (4%)', value: '4' },
          { title: 'Large (6%)', value: '6' },
        ],
        layout: 'radio',
      },
      initialValue: '0',
    }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Left & right media',
      description: 'Exactly two items: left (50% width) and right (50% width). On mobile they stack (100% width, 50% height each).',
      hidden: ({ parent }) => parent?.layout !== 'twoUp',
      of: [defineArrayMember({ type: 'twoUpItem' })],
      validation: (Rule) => Rule.length(2).error('2-up slides must have exactly 2 items'),
    }),
    defineField({
      name: 'mediaType',
      type: 'string',
      title: 'Media type',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video (URL)', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      validation: (Rule) => Rule.required(),
      hidden: ({ parent }) => parent?.layout === 'twoUp',
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image (upload)',
      hidden: ({ parent }) => parent?.layout === 'twoUp' || parent?.mediaType !== 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'imageUrl',
      type: 'url',
      title: 'Image URL (external)',
      description: 'Use for external images (e.g. from a CDN). Ignored if Image upload is set.',
      hidden: ({ parent }) => parent?.layout === 'twoUp' || parent?.mediaType !== 'image',
    }),
    defineField({
      name: 'videoUrl',
      type: 'url',
      title: 'Video URL',
      description: 'Link to video (e.g. MUX, Vimeo, or direct URL). MUX integration can be added later.',
      hidden: ({ parent }) => parent?.layout === 'twoUp' || parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'caption',
      type: 'string',
      title: 'Caption',
      hidden: ({ parent }) => parent?.layout === 'twoUp',
    }),
    defineField({
      name: 'backgroundColor',
      type: 'string',
      title: 'Background color',
      description: 'Hex color for this slide (e.g. #000000). Defaults to black if empty.',
      initialValue: '#000000',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (value === undefined || value === null || value === '') return true
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)
            ? true
            : 'Enter a valid hex color (e.g. #000000 or #fff)'
        }),
    }),
    defineField({
      name: 'textTheme',
      type: 'string',
      title: 'Text & header color (override)',
      description: 'Override the project theme for this slide only. Header, title, description and slide number use this when this slide is visible.',
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
      hidden: ({ parent }) => parent?.textTheme !== 'custom',
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const parent = ctx?.parent as { textTheme?: string } | undefined
          if (parent?.textTheme !== 'custom') return true
          if (!value) return 'Required when using Custom.'
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) ? true : 'Enter a valid hex (e.g. #fff or #333).'
        }),
    }),
  ],
  preview: {
    select: {
      layout: 'layout',
      media: 'image',
      mediaType: 'mediaType',
      items: 'items',
    },
    prepare({ layout, media, mediaType, items }) {
      if (layout === 'twoUp') {
        const firstMedia = Array.isArray(items) ? items[0] : undefined
        return {
          title: '2-up',
          subtitle: 'Two images side by side',
          media: firstMedia?.image ?? media,
        }
      }
      const layoutLabel = layout === 'contain' ? 'Contain' : 'Full bleed'
      const typeLabel = mediaType === 'video' ? 'Video' : 'Image'
      return {
        title: `${layoutLabel} · ${typeLabel}`,
        media,
      }
    },
  },
})
