/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Tenant resolved from the request Host header by `src/middleware.ts`. */
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- global ambient declaration, cannot use a top-level import
    tenant: import('@grn/types').Tenant
  }
}

// Variables/secrets configured in the Cloudflare dashboard (or .dev.vars locally); not in wrangler.jsonc.
declare namespace Cloudflare {
  interface Env {
    PAYLOAD_API_URL: string
    PAYLOAD_API_KEY?: string
    DEV_TENANT_HOST?: string
  }
}
