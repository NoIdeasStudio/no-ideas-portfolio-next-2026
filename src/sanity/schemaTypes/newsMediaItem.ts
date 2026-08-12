import { defineField, defineType } from 'sanity'
import {
  alphaVideoFallbackFields,
  backgroundAlphaVideoFallbackFields,
} from './videoAlphaFallbackFields'

/** One slide in a news post slideshow — same options as project slides (minus 2-up). */
export const newsMediaItemObject = defineType({
  name: 'newsMediaItem',
  type: 'object',
  title: 'Slide',
  fields: [
    defineField({
      name: 'layout',
      type: 'string',
      title: 'Layout',
      options: {
        list: [
          { title: 'Cover (full bleed)', value: 'fullBleed' },
          { title: 'Contain', value: 'contain' },
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
      name: 'mediaType',
      type: 'string',
      title: 'Media type',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
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
      name: 'videoFile',
      type: 'file',
      title: 'Video (upload)',
      options: {
        accept: 'video/mp4,video/quicktime,video/webm,video/x-m4v,.mp4,.mov,.webm,.m4v',
      },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),
    ...alphaVideoFallbackFields(),
    defineField({
      name: 'videoUrl',
      type: 'url',
      title: 'Video URL (legacy)',
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
      name: 'caption',
      type: 'string',
      title: 'Caption',
    }),
    defineField({
      name: 'backgroundTransparent',
      type: 'boolean',
      title: 'Transparent background',
      description: 'When enabled, no background fill is applied behind the media.',
      initialValue: false,
    }),
    defineField({
      name: 'backgroundColor',
      type: 'string',
      title: 'Background color',
      description: 'Hex color behind the media (e.g. #000000). Defaults to black when empty.',
      hidden: ({ parent }) => parent?.backgroundTransparent === true,
      initialValue: '#000000',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { backgroundTransparent?: boolean } | undefined
          if (parent?.backgroundTransparent) return true
          if (value === undefined || value === null || value === '') return true
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)
            ? true
            : 'Enter a valid hex color (e.g. #000000 or #fff)'
        }),
    }),
    defineField({
      name: 'backgroundVideoFile',
      type: 'file',
      title: 'Background video (upload)',
      description: 'Video played as a full-cover background behind the slide content.',
      options: {
        accept: 'video/mp4,video/quicktime,video/webm,video/x-m4v,.mp4,.mov,.webm,.m4v',
      },
    }),
    ...backgroundAlphaVideoFallbackFields,
    defineField({
      name: 'backgroundVideoUrl',
      type: 'url',
      title: 'Background video URL (legacy)',
    }),
  ],
  preview: {
    select: {
      layout: 'layout',
      mediaType: 'mediaType',
      media: 'image',
    },
    prepare({ layout, mediaType, media }) {
      const layoutLabel = layout === 'contain' ? 'Contain' : 'Cover'
      const typeLabels: Record<string, string> = {
        image: 'Image',
        video: 'Video',
        lottie: 'Lottie',
        animatedSvg: 'Animated SVG',
      }
      return {
        title: `${layoutLabel} · ${typeLabels[mediaType] ?? 'Media'}`,
        media,
      }
    },
  },
})
