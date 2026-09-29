/**
 * True when the authenticated principal is a user with the `super-admin` role.
 * `req.user` can also be a plugin-mcp API key document (no `roles`), so this takes `unknown`.
 */
export function isSuperAdmin(user: unknown): boolean {
  if (!user || typeof user !== 'object' || !('roles' in user)) return false
  const { roles } = user
  return Array.isArray(roles) && roles.includes('super-admin')
}
