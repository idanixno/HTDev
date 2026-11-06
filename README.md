# ژرفا / Zharfa (HTDev)

Personal education platform (one instructor). Persian RTL primary. Monorepo: Next.js web, NestJS API, BullMQ worker, Prisma + PostgreSQL, Redis, MinIO.

Figma: [EDU / Zharfa](https://www.figma.com/design/ecYEt09V8ZOGzG2sRd4cC1)

## Stack

| App / package | Role |
|---------------|------|
| `apps/web` | Next.js App Router, RTL shell, dark/light tokens |
| `apps/api` | NestJS HTTP API |
| `apps/worker` | BullMQ background jobs |
| `packages/database` | Prisma schema + client |
| `packages/ui` | Zharfa CSS design tokens |
| `packages/config` | Shared TS configs |

## Prerequisites

- Node.js ≥ 20
- [pnpm](https://pnpm.io) 10.x (`corepack enable`)
- Docker + Docker Compose (Postgres, Redis, MinIO)

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Environment
cp .env.example .env

# 3. Infrastructure
pnpm docker:up
# or: docker compose up -d

# 4. Database client + migrate (after Postgres is healthy)
pnpm db:generate
pnpm --filter @zharfa/database exec prisma migrate dev --name init

# 5. Run apps (separate terminals, or turbo)
pnpm --filter @zharfa/web dev      # http://localhost:3000
pnpm --filter @zharfa/api dev      # http://localhost:4000/health
pnpm --filter @zharfa/worker dev   # http://localhost:4001/health
```

All apps (turbo):

```bash
pnpm dev
```

## Health stubs

| Service | URL |
|---------|-----|
| Web | `GET http://localhost:3000/api/health` |
| API | `GET http://localhost:4000/health` |
| Worker | `GET http://localhost:4001/health` |

## Important product constraints

- Currency display: **Toman**
- Payments: ZarinPal + AqayePardakht adapters only — **no fabricated payment success**
- Protected video: SpotPlayer — **no fake license success**
- Not a multi-instructor marketplace; no custom video hosting

## Docs

- [`docs/IMPLEMENTATION_STATUS.md`](./docs/IMPLEMENTATION_STATUS.md) — living feature ledger
- [`docs/phase-0-repo-audit.md`](./docs/phase-0-repo-audit.md) — Phase 0 repository audit
- [`SECURITY.md`](./SECURITY.md) — security posture

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Turbo dev for all packages |
| `pnpm build` | Build all |
| `pnpm docker:up` / `pnpm docker:down` | Compose infra |
| `pnpm db:generate` | Prisma generate |
| `pnpm db:migrate` | Prisma migrate dev |
| `pnpm db:studio` | Prisma Studio |
