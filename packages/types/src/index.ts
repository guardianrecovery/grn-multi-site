/** Slug of a tenant (site) in the CMS. Matches `tenants.slug` in Payload. */
export type TenantSlug = string

/** Minimal tenant shape the web app needs. Placeholder until the pilot's discovery is done. */
export interface Tenant {
  id: number | string
  name: string
  slug: TenantSlug
  /** Public hostname the tenant's site is served from, e.g. `example.com` (no scheme, no port). */
  domain: string
}

/** Placeholder page shape. The real schema comes from the pilot site's discovery. */
export interface Page {
  id: number | string
  title: string
  slug: string
}

/** Envelope Payload's REST API returns for list endpoints. */
export interface PayloadListResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/** Normalize a Host header value to a bare lowercase hostname (drops port and trailing dot). */
export function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '')
}
