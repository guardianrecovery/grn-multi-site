import type { Page, PayloadListResponse, Tenant, TenantSlug } from '@grn/types'
import { normalizeHost } from '@grn/types'

export interface PayloadClientOptions {
  /** Base URL of the Payload CMS, e.g. `https://cms.example.com` (no trailing slash needed). */
  baseUrl: string
  /** Optional Payload user API key, sent as `Authorization: users API-Key <key>`. */
  apiKey?: string
  /** Injectable for tests. Defaults to the global `fetch`. */
  fetch?: typeof fetch
}

/** Payload REST `where` filters are bracket-encoded query params: `where[field][operator]=value`. */
function buildUrl(
  { baseUrl }: PayloadClientOptions,
  collection: string,
  params: Record<string, string>,
): string {
  const url = new URL(`/api/${collection}`, baseUrl)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  return url.toString()
}

async function getList<T>(
  options: PayloadClientOptions,
  collection: string,
  params: Record<string, string>,
): Promise<PayloadListResponse<T>> {
  const doFetch = options.fetch ?? fetch
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.apiKey) headers.Authorization = `users API-Key ${options.apiKey}`

  const response = await doFetch(buildUrl(options, collection, params), { headers })
  if (!response.ok) {
    throw new Error(`Payload REST ${collection} request failed: ${response.status}`)
  }
  return (await response.json()) as PayloadListResponse<T>
}

/** Host header -> tenant. Returns null when no tenant owns that hostname. */
export async function fetchTenantByHost(
  host: string,
  options: PayloadClientOptions,
): Promise<Tenant | null> {
  const result = await getList<Tenant>(options, 'tenants', {
    'where[domain][equals]': normalizeHost(host),
    limit: '1',
    depth: '0',
  })
  return result.docs[0] ?? null
}

/** Tenant slug -> that tenant's pages. Always scoped: never queries pages without a tenant. */
export async function fetchPagesForTenant(
  tenantSlug: TenantSlug,
  options: PayloadClientOptions,
): Promise<Page[]> {
  const result = await getList<Page>(options, 'pages', {
    'where[tenant.slug][equals]': tenantSlug,
    limit: '100',
    depth: '0',
  })
  return result.docs
}
