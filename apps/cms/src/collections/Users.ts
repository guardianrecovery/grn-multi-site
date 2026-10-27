import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access/isSuperAdmin'

export const userRoles = ['super-admin', 'tenant-admin'] as const

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  // API keys let the MCP endpoint (and other machine clients) authenticate as a user.
  auth: { useAPIKey: true },
  hooks: {
    beforeChange: [
      // The very first user is the bootstrap super-admin. Everyone after starts as tenant-admin.
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', req })
        if (totalDocs === 0) data.roles = ['super-admin']
        return data
      },
    ],
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['tenant-admin'],
      saveToJWT: true,
      options: [...userRoles],
      access: {
        create: ({ req }) => isSuperAdmin(req.user),
        update: ({ req }) => isSuperAdmin(req.user),
      },
    },
    // The multi-tenant plugin adds the `tenants` array field (which tenants a user belongs to).
  ],
}
