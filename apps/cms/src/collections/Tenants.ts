import type { CollectionConfig } from 'payload'

/**
 * One document per site. The web app resolves the incoming Host header against `domain`,
 * then scopes all content queries by `slug`.
 */
export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
  },
  // Public read: the web app needs to resolve Host -> tenant without credentials.
  // Only expose non-sensitive fields on this collection.
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'URL-safe identifier, e.g. saddlebrook-counseling' },
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Public hostname this tenant is served from: no scheme, no port, e.g. example.com',
      },
    },
  ],
}
