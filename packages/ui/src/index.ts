import type { Tenant } from '@grn/types'

/** Placeholder helper. Proves `@grn/ui` resolves `@grn/types` across the workspace. */
export function siteTitle(tenant: Pick<Tenant, 'name'>, pageTitle?: string): string {
  return pageTitle ? `${pageTitle} | ${tenant.name}` : tenant.name
}
