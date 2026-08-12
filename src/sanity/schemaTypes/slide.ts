import { defineArrayMember, defineField, defineType } from 'sanity'
import {
  alphaVideoFallbackFields,
  backgroundAlphaVideoFallbackFields,
} from './videoAlphaFallbackFields'

type TwoUpSlideParent = {
  layout?: string
  items?: Array<{ fit?: string; containPadding?: string }>
}

function bothTwoUpItemsContainWithPadding(parent: TwoUpSlideParent | undefined) {
  if (parent?.layout !== 'twoUp') return false
  const items = parent?.items
  if (!items?.[0] || !items?.[1]) return false
  return (
    items[0].fit === 'contain' &&
    items[1].fit === 'contain' &&
    items[0].containPadding !== '0' &&
    items[1].containPadding !== '0'
  )
}

/** Reusable slide block: layout + image or video. */
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
      name: 'twoUpSpacing',
      type: 'string',
      title: '2-up spacing (desktop)',
      description:
        'Controls gap and alignment between the two images on desktop. Mobile always uses default spacing with centered images.',
      initialValue: 'default',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Equal gap, centered', value: 'equalCentered' },
          { title: 'Equal gap, hug gutter', value: 'equalHugGutter' },
        ],
        layout: 'radio',
      },
      hidden: ({ parent }) => !bothTwoUpItemsContainWithPadding(parent as TwoUpSlideParent),
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (!value || value === 'default') return true
          if (bothTwoUpItemsContainWithPadding(context.parent as TwoUpSlideParent)) return true
          return 'Only applies when both items use Contain with padding'
        }),
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
      name: 'videoFile',
      type: 'file',
      title: 'Video (upload)',
      description: 'Upload a video file (.mp4, .mov, .webm, .m4v).',
      options: {
        accept: 'video/mp4,video/quicktime,video/webm,video/x-m4v,.mp4,.mov,.webm,.m4v',
      },
      hidden: ({ parent }) => parent?.layout === 'twoUp' || parent?.mediaType !== 'video',
    }),
    ...alphaVideoFallbackFields({ hideWhenTwoUp: true }),
    defineField({
      name: 'videoUrl',
      type: 'url',
      title: 'Video URL (legacy)',
      description: 'Deprecated — use Video upload. Kept for unmigrated external URLs.',
      hidden: ({ parent }) => parent?.layout === 'twoUp' || parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'lottieFile',
      type: 'file',
      title: 'Lottie animation file',
      description: 'Upload a Lottie JSON file (.json).',
      options: { accept: '.json,application/json' },
      hidden: ({ parent }) => parent?.layout === 'twoUp' || parent?.mediaType !== 'lottie',
    }),
    defineField({
      name: 'animatedSvgFile',
      type: 'file',
      title: 'Animated SVG file',
      description: 'Upload an animated SVG file (.svg), e.g. exported from Figma Motion.',
      options: { accept: '.svg,image/svg+xml' },
      hidden: ({ parent }) => parent?.layout === 'twoUp' || parent?.mediaType !== 'animatedSvg',
    }),
    defineField({
      name: 'animatedSvgUrl',
      type: 'url',
      title: 'Animated SVG URL (external)',
      description: 'Link to an animated SVG on a CDN. Ignored if file upload is set.',
      hidden: ({ parent }) => parent?.layout === 'twoUp' || parent?.mediaType !== 'animatedSvg',
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
      description: 'Deprecated — use Background video upload.',
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
