import { defineField } from 'sanity'

type VideoFieldParent = {
  layout?: string
  mediaType?: string
  hasTransparency?: boolean
  backgroundHasTransparency?: boolean
  backgroundVideoFile?: { asset?: unknown } | null
}

/** Optional Chrome WebM fallback, shown only when a video needs transparency. */
export function alphaVideoFallbackFields(options: { hideWhenTwoUp?: boolean } = {}) {
  const hideMain = (parent: VideoFieldParent | undefined) => {
    if (options.hideWhenTwoUp && parent?.layout === 'twoUp') return true
    return parent?.mediaType !== 'video'
  }

  return [
    defineField({
      name: 'hasTransparency',
      type: 'boolean',
      title: 'Needs transparency',
      description:
        'Turn on for HEVC/MOV videos with an alpha channel. You can optionally add a WebM for Chrome; Safari still uses the main video.',
      initialValue: false,
      hidden: ({ parent }) => hideMain(parent as VideoFieldParent),
    }),
    defineField({
      name: 'videoFileWebm',
      type: 'file',
      title: 'Chrome fallback (WebM)',
      description:
        'Optional VP9 WebM with alpha. Not required — leave empty if you only need Safari. Chrome uses this when present.',
      options: { accept: 'video/webm,.webm' },
      hidden: ({ parent }) => {
        const p = parent as VideoFieldParent
        return hideMain(p) || p?.hasTransparency !== true
      },
    }),
  ]
}

export const backgroundAlphaVideoFallbackFields = [
  defineField({
    name: 'backgroundHasTransparency',
    type: 'boolean',
    title: 'Background video needs transparency',
    description:
      'Turn on if the background video has an alpha channel. Optionally add a WebM for Chrome.',
    initialValue: false,
    hidden: ({ parent }) => !(parent as VideoFieldParent)?.backgroundVideoFile?.asset,
  }),
  defineField({
    name: 'backgroundVideoFileWebm',
    type: 'file',
    title: 'Background Chrome fallback (WebM)',
    description: 'Optional VP9 WebM with alpha for Chrome. Not required.',
    options: { accept: 'video/webm,.webm' },
    hidden: ({ parent }) => {
      const p = parent as VideoFieldParent
      return !p?.backgroundVideoFile?.asset || p?.backgroundHasTransparency !== true
    },
  }),
]
