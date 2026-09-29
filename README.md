# grn-multi-site

Guardian Recovery Network's multi-site platform: one Payload CMS, many Astro sites, all on
Cloudflare Workers.

```
apps/cms         Payload CMS (Next.js via OpenNext) on Workers + D1 + R2. Multi-tenant.
apps/web         Astro site on Workers. Resolves the tenant from the request Host header.
packages/ui      Shared Astro components and helpers.
packages/types   Shared TypeScript types (tenant model, Payload REST shapes).
packages/config  Shared tsconfig and ESLint config.
```

## Requirements

Node 24 (see `.nvmrc`) and pnpm 11 (`packageManager` in `package.json`).

## Local development

```bash
pnpm install
cp apps/cms/.env.example apps/cms/.env        # then set PAYLOAD_SECRET
cp apps/web/.dev.vars.example apps/web/.dev.vars
pnpm --filter @grn/cms payload migrate         # local D1: schema + seeded tenant
pnpm --filter @grn/cms dev                     # http://localhost:3000/admin
pnpm --filter @grn/web dev                     # http://localhost:4321
```

The seeded tenant `saddlebrook-counseling` uses the placeholder domain
`saddlebrook-counseling.localhost` (browsers resolve `*.localhost` to loopback), so visit
`http://saddlebrook-counseling.localhost:4321`. Change the domain in the CMS admin to the real
hostname before launch.

Root scripts: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (all via Turborepo).

## How tenancy works

- CMS: `@payloadcms/plugin-multi-tenant` adds a `tenant` field to `pages` and `media`.
  `tenants` holds `name`, `slug`, `domain`. The first user created becomes `super-admin`.
- Web: `src/middleware.ts` maps Host header -> tenant (`GET /api/tenants?where[domain][equals]=...`)
  -> `Astro.locals.tenant`. Content is then fetched scoped by `where[tenant.slug][equals]=<slug>`
  over Payload's REST API (not GraphQL).

## CMS collections

`pages` is a placeholder (`title`, `slug`). The real schema belongs to the pilot site's discovery.

## MCP

`@payloadcms/plugin-mcp` (>= 3.64.0, pinned to the same version as `payload`) serves `/api/mcp`.
Create per-key permissions in the admin under "MCP API Keys". Only `pages`, `media` and `tenants`
are exposed; `users` is not.

## CI and deploys

- `.github/workflows/ci.yml` runs lint, typecheck and test on pull requests. It does not deploy.
- Deploys come from Cloudflare Workers Builds (Git integration), production branch `main`:
  - `grn-cms`: root directory `/apps/cms/`, deploy command `pnpm run deploy`
    (applies D1 migrations, then builds and deploys with OpenNext).
  - `grn-web`: root directory `/apps/web/`.
- Worker variables/secrets set in the dashboard survive deploys (`keep_vars`):
  - `grn-cms`: `PAYLOAD_SECRET` (secret)
  - `grn-web`: `PAYLOAD_API_URL` (URL of `grn-cms`), optional `PAYLOAD_API_KEY`
