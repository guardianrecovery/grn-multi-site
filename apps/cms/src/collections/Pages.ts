import type { CollectionConfig } from 'payload'

/**
 * PLACEHOLDER. The real page schema (blocks, SEO fields, etc.) is decided by the pilot site
 * once it has done real discovery. Do not build on these fields.
 * The `tenant` field is added by the multi-tenant plugin.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
    },
  ],
}
