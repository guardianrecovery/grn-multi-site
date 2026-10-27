import type { Tenant } from '@grn/types'
import { normalizeHost } from '@grn/types'
import { fetchTenantByHost, type PayloadClientOptions } from './payload'

const TTL_MS = 60_000
const cache = new Map<string, { tenant: Tenant; expires: number }>()

/**
 * Pick the hostname to resolve. Prefers `X-Forwarded-Host` (set by some proxies), then `Host`.
 * `devHost` lets local dev on plain `localhost` map to a seeded tenant domain.
 */
export function hostFromRequest(request: Request, devHost?: string): string {
  const raw =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    new URL(request.url).host
  const host = normalizeHost(raw.split(',')[0] ?? raw)
  if (devHost && (host === 'localhost' || host === '127.0.0.1')) return normalizeHost(devHost)
  return host
}

/**
 * Host -> tenant, with a short per-isolate cache so a page view doesn't cost a CMS round trip
 * for the tenant lookup. Only hits are cached, so a newly added tenant resolves immediately.
 * Returns null for hostnames no tenant owns.
 */
export async function resolveTenant(
  host: string,
  options: PayloadClientOptions,
  now: number = Date.now(),
): Promise<Tenant | null> {
  const key = normalizeHost(host)
  const cached = cache.get(key)
  if (cached && cached.expires > now) return cached.tenant

  const tenant = await fetchTenantByHost(key, options)
  if (tenant) cache.set(key, { tenant, expires: now + TTL_MS })
  return tenant
}

/** Test helper. */
export function clearTenantCache(): void {
  cache.clear()
}
