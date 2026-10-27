import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchPagesForTenant } from './payload'
import { clearTenantCache, hostFromRequest, resolveTenant } from './tenant'

const tenant = {
  id: 1,
  name: 'Saddlebrook Counseling',
  slug: 'saddlebrook-counseling',
  domain: 'saddlebrook-counseling.localhost',
}

function listResponse<T>(docs: T[]) {
  return new Response(
    JSON.stringify({
      docs,
      totalDocs: docs.length,
      limit: 10,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  )
}

describe('hostFromRequest', () => {
  it('reads and normalizes the Host header', () => {
    const request = new Request('http://internal/', { headers: { host: 'Example.com:8787' } })
    expect(hostFromRequest(request)).toBe('example.com')
  })

  it('prefers X-Forwarded-Host and takes the first value', () => {
    const request = new Request('http://internal/', {
      headers: { host: 'internal', 'x-forwarded-host': 'site.com, proxy.net' },
    })
    expect(hostFromRequest(request)).toBe('site.com')
  })

  it('maps plain localhost to devHost when provided', () => {
    const request = new Request('http://localhost:4321/', { headers: { host: 'localhost:4321' } })
    expect(hostFromRequest(request, 'saddlebrook-counseling.localhost')).toBe(
      'saddlebrook-counseling.localhost',
    )
  })

  it('does not apply devHost to real hostnames', () => {
    const request = new Request('https://site.com/', { headers: { host: 'site.com' } })
    expect(hostFromRequest(request, 'other.localhost')).toBe('site.com')
  })
})

describe('resolveTenant', () => {
  beforeEach(() => clearTenantCache())

  it('queries tenants by normalized domain and returns the tenant', async () => {
    const fetchMock = vi.fn().mockResolvedValue(listResponse([tenant]))
    const result = await resolveTenant('Saddlebrook-Counseling.localhost:4321', {
      baseUrl: 'http://cms.test',
      fetch: fetchMock,
    })

    expect(result).toEqual(tenant)
    const url = new URL(fetchMock.mock.calls[0]![0] as string)
    expect(url.pathname).toBe('/api/tenants')
    expect(url.searchParams.get('where[domain][equals]')).toBe('saddlebrook-counseling.localhost')
  })

  it('returns null for an unknown host and does not cache the miss', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => listResponse([]))
    const options = { baseUrl: 'http://cms.test', fetch: fetchMock }

    expect(await resolveTenant('unknown.test', options)).toBeNull()
    expect(await resolveTenant('unknown.test', options)).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('serves repeat lookups from cache until the TTL expires', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => listResponse([tenant]))
    const options = { baseUrl: 'http://cms.test', fetch: fetchMock }

    await resolveTenant(tenant.domain, options, 1_000)
    await resolveTenant(tenant.domain, options, 2_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await resolveTenant(tenant.domain, options, 1_000 + 60_001)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

describe('fetchPagesForTenant', () => {
  it('scopes the query by tenant slug and sends the API key when set', async () => {
    const fetchMock = vi.fn().mockResolvedValue(listResponse([{ id: 1, title: 'Home', slug: '' }]))
    const pages = await fetchPagesForTenant('saddlebrook-counseling', {
      baseUrl: 'http://cms.test',
      apiKey: 'secret',
      fetch: fetchMock,
    })

    expect(pages).toHaveLength(1)
    const [rawUrl, init] = fetchMock.mock.calls[0]! as [string, RequestInit]
    const url = new URL(rawUrl)
    expect(url.pathname).toBe('/api/pages')
    expect(url.searchParams.get('where[tenant.slug][equals]')).toBe('saddlebrook-counseling')
    expect((init.headers as Record<string, string>).Authorization).toBe('users API-Key secret')
  })

  it('throws on a non-OK response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('nope', { status: 500 }))
    await expect(
      fetchPagesForTenant('x', { baseUrl: 'http://cms.test', fetch: fetchMock }),
    ).rejects.toThrow('500')
  })
})
