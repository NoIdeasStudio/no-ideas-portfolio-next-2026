import { defineArrayMember } from 'sanity'

/** Portable text block with URL link annotations only. */
export const linkableBlockMember = defineArrayMember({
  type: 'block',
  styles: [{ title: 'Normal', value: 'normal' }],
  lists: [],
  marks: {
    decorators: [],
    annotations: [
      {
        name: 'link',
        type: 'object',
        title: 'URL',
        fields: [
          { name: 'href', type: 'url', title: 'URL' },
          {
            name: 'blank',
            type: 'boolean',
            title: 'Open in new tab',
            initialValue: true,
          },
        ],
      },
    ],
  },
})
