import { defineField, defineType } from 'sanity'

/**
 * Singleton: global site metadata, branding, and SEO defaults.
 * Managed in Studio under Site Settings (document id: site-settings).
 */
export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fieldsets: [
    { name: 'general', title: 'General', options: { columns: 2 } },
    { name: 'seo', title: 'Search & social', options: { collapsible: true } },
    { name: 'analytics', title: 'Analytics', options: { collapsible: true } },
    { name: 'branding', title: 'Icons', options: { collapsible: true } },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Site name',
      type: 'string',
      fieldset: 'general',
      description: 'Used in the browser tab, search results, and social previews.',
      validation: (Rule) => Rule.required(),
      initialValue: 'No Ideas',
    }),
    defineField({
      name: 'siteUrl',
      title: 'Production URL',
      type: 'url',
      fieldset: 'general',
      description:
        'Your live domain, e.g. https://noideas.com. Used for canonical URLs, sitemap, and Open Graph links.',
      validation: (Rule) =>
        Rule.uri({ allowRelative: false, scheme: ['https', 'http'] }).required(),
    }),
    defineField({
      name: 'seo',
      title: 'Default SEO',
      type: 'seo',
      fieldset: 'seo',
      description: 'Default metadata for the homepage and fallback for pages without their own SEO fields.',
    }),
    defineField({
      name: 'googleAnalyticsId',
      title: 'Google Analytics measurement ID',
      type: 'string',
      fieldset: 'analytics',
      description: 'GA4 measurement ID (e.g. G-XXXXXXXXXX). Loads gtag.js on the live site when set.',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true
          return /^G-[A-Z0-9]+$/.test(value)
            ? true
            : 'Use a GA4 measurement ID like G-XXXXXXXXXX'
        }),
      initialValue: 'G-P2PCFLQFKC',
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      fieldset: 'branding',
      description: 'Square image shown in browser tabs. Recommended: 32×32 or 512×512 px PNG.',
      options: { accept: 'image/png,image/svg+xml,image/x-icon' },
    }),
    defineField({
      name: 'appleTouchIcon',
      title: 'Apple touch icon',
      type: 'image',
      fieldset: 'branding',
      description: 'Icon when saved to an iOS home screen. Recommended: 180×180 px PNG.',
      options: { accept: 'image/png' },
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
