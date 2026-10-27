import { env } from 'cloudflare:workers'
import { defineMiddleware } from 'astro:middleware'
import { hostFromRequest, resolveTenant } from './lib/tenant'

/**
 * Domain-based tenancy: Host header -> tenant (from the CMS) -> `Astro.locals.tenant`.
 * Pages then fetch content scoped to `locals.tenant.slug`.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const baseUrl = env.PAYLOAD_API_URL
  if (!baseUrl) {
    return new Response('PAYLOAD_API_URL is not configured', { status: 500 })
  }

  const devHost = import.meta.env.DEV ? env.DEV_TENANT_HOST : undefined
  const host = hostFromRequest(context.request, devHost)

  const tenant = await resolveTenant(host, { baseUrl, apiKey: env.PAYLOAD_API_KEY })
  if (!tenant) {
    return new Response(`No site is configured for ${host}`, { status: 404 })
  }

  context.locals.tenant = tenant
  return next()
})
