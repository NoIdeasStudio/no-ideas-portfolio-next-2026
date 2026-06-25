import { defineField, defineType } from 'sanity'

/** One media slot in a 2-up slide (left or right). */
export const twoUpItemObject = defineType({
  name: 'twoUpItem',
  type: 'object',
  title: '2-up item',
  fields: [
    defineField({
      name: 'mediaType',
      type: 'string',
      title: 'Media type',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video (URL)', value: 'video' },
          { title: 'Lottie animation', value: 'lottie' },
          { title: 'Animated SVG', value: 'animatedSvg' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image (upload)',
      hidden: ({ parent }) => parent?.mediaType !== 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'imageUrl',
      type: 'url',
      title: 'Image URL (external)',
      description: 'Use for external images. Ignored if Image upload is set.',
      hidden: ({ parent }) => parent?.mediaType !== 'image',
    }),
    defineField({
      name: 'videoUrl',
      type: 'url',
      title: 'Video URL',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'lottieFile',
      type: 'file',
      title: 'Lottie animation file',
      description: 'Upload a Lottie JSON file (.json).',
      options: { accept: '.json,application/json' },
      hidden: ({ parent }) => parent?.mediaType !== 'lottie',
    }),
    defineField({
      name: 'animatedSvgFile',
      type: 'file',
      title: 'Animated SVG file',
      description: 'Upload an animated SVG file (.svg), e.g. exported from Figma Motion.',
      options: { accept: '.svg,image/svg+xml' },
      hidden: ({ parent }) => parent?.mediaType !== 'animatedSvg',
    }),
    defineField({
      name: 'animatedSvgUrl',
      type: 'url',
      title: 'Animated SVG URL (external)',
      description: 'Link to an animated SVG on a CDN. Ignored if file upload is set.',
      hidden: ({ parent }) => parent?.mediaType !== 'animatedSvg',
    }),
    defineField({
      name: 'backgroundVideoUrl',
      type: 'url',
      title: 'Background video URL',
      description: 'Video played as a full-cover background behind the cell content.',
    }),
    defineField({
      name: 'fit',
      type: 'string',
      title: 'Fit',
      description: 'Cover fills the cell; Contain fits the media with optional padding.',
      options: {
        list: [
          { title: 'Cover', value: 'cover' },
          { title: 'Contain', value: 'contain' },
        ],
        layout: 'radio',
      },
      initialValue: 'cover',
    }),
    defineField({
      name: 'containPadding',
      type: 'string',
      title: 'Padding (contain only)',
      description: 'Padding when Fit is Contain.',
      hidden: ({ parent }) => parent?.fit !== 'contain',
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
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      media: 'image',
    },
    prepare({ mediaType, media }) {
      return {
        title: mediaType === 'video' ? 'Video' : 'Image',
        media,
      }
    },
  },
})
