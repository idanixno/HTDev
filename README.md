# ژرفا / Zharfa (HTDev)

Personal education platform (one instructor). Persian RTL primary. Monorepo: Next.js web, NestJS API, BullMQ worker, Prisma + PostgreSQL, Redis, MinIO.

Figma: [EDU / Zharfa](https://www.figma.com/design/ecYEt09V8ZOGzG2sRd4cC1)

## Stack

| App / package | Role |
|---------------|------|
| `apps/web` | Next.js App Router, RTL shell, auth BFF, student dashboard |
| `apps/api` | NestJS HTTP API + Identity module |
| `apps/worker` | BullMQ background jobs |
| `packages/database` | Prisma schema + client + seed |
| `packages/ui` | Zharfa design system (`@zharfa/ui`) |
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
pnpm db:migrate

# 5. Seed demo users (admin + students)
pnpm db:seed

# 6. Run apps (separate terminals, or turbo)
pnpm --filter @zharfa/web dev      # http://localhost:3000
pnpm --filter @zharfa/api dev      # http://localhost:4000/health
pnpm --filter @zharfa/worker dev   # http://localhost:4001/health
```

All apps (turbo):

```bash
pnpm dev
```

## Demo accounts (seed)

Passwords are **env-configurable** (see `.env.example`):

| Role | Username | Email | Phone | Env var | Default (local only) |
|------|----------|-------|-------|---------|----------------------|
| OWNER (admin) | `admin` | `admin@zharfa.local` | `09120000000` | `SEED_ADMIN_PASSWORD` | `ChangeMeAdmin!23` |
| STUDENT | `sara` | `sara@example.com` | `09121111111` | `SEED_STUDENT_PASSWORD` | `ChangeMeStudent!23` |
| STUDENT | `reza` | `reza@example.com` | `09122222222` | same | same |
| STUDENT | `niloofar` | `niloofar@example.com` | `09123333333` | same | same |
| STUDENT | `amir` | `amir@example.com` | — | same | same |

Login accepts **username, email, or phone** + password. Recovery OTP is logged by the console email/SMS provider in API logs (no real SMS/email in local).

## Auth surface

| Surface | Path |
|---------|------|
| Login | `/login` |
| Register | `/register` |
| Recover password | `/recover` |
| Student dashboard (gated) | `/dashboard` |
| API identity | `POST /identity/register\|login\|logout`, `GET /identity/me`, `POST /identity/recover/*` |

Web sets an **HttpOnly** `zharfa_session` cookie via Next.js BFF routes under `/api/auth/*`. Nest also accepts the same token as cookie or `Authorization: Bearer`.

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
- SMS/email: interface + **console/dev provider** only until real credentials exist

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
| `pnpm db:seed` | Seed admin + students |
| `pnpm db:studio` | Prisma Studio |
| `pnpm --filter @zharfa/api test` | Identity unit tests |
