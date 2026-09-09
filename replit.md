# Apples

A platform where fans pitch product ideas to brands, vote them up, and preorder once an idea clears its vote threshold -- if enough people preorder, the brand commits to producing it.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Frontend: `artifacts/fikirhane` (React + Vite, served at `/`)
- API contract: `lib/api-spec/openapi.yaml`
- DB schema: `lib/db/src/schema/{companies,ideas,preorders}.ts`
- Routes: `artifacts/api-server/src/routes/{companies,ideas}.ts`

## Architecture decisions

- `Idea.status` (`voting` → `preorder` → `producing`) is computed server-side from `voteCount`/`preorderCount` vs. thresholds, never stored — avoids drift between counters and status.
- Preorders are anonymous (email only, no accounts). A unique index on `preorders(idea_id, email)` blocks the same email from preordering the same idea twice; the insert + counter increment run in one DB transaction.
- Voting is fully anonymous with no dedup — anyone can vote multiple times. Acceptable for this prototype; revisit with real user accounts if this goes further.

## Product

- Browse ideas pitched to brands (`/`), browse brands (`/brands`), view a brand's ideas (`/brands/:id`)
- Pitch a new idea to a brand (`/submit`) or add a new brand (`/brands/new`)
- View an idea's detail page, vote it up, and once it clears its vote threshold, preorder by email (`/ideas/:id`)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
