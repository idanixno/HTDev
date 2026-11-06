# ژرفا / Zharfa (HTDev)

Personal education platform (one instructor). Persian RTL primary. Monorepo: Next.js web, NestJS API, BullMQ worker, Prisma + PostgreSQL, Redis, MinIO.

Figma: [EDU / Zharfa](https://www.figma.com/design/ecYEt09V8ZOGzG2sRd4cC1)

## Stack

| App / package | Role |
|---------------|------|
| `apps/web` | Next.js App Router, RTL shell, auth BFF, catalog/paths, student dashboard |
| `apps/api` | NestJS HTTP API + Identity + Catalog + Commerce modules |
| `apps/worker` | BullMQ background jobs |
| `packages/database` | Prisma schema + client + seed (users + education catalog) |
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

# 5. Seed demo users + Persian catalog (courses, curriculum, paths)
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

Seed also creates **3 categories**, **6 courses** (5 publicly listed), curriculum/lessons, and **2 learning paths**, with SVG artwork placeholders under `apps/web/public/artwork/`.

## Auth surface

| Surface | Path |
|---------|------|
| Login | `/login` |
| Register | `/register` |
| Recover password | `/recover` |
| Student dashboard (gated) | `/dashboard` |
| API identity | `POST /identity/register\|login\|logout`, `GET /identity/me`, `POST /identity/recover/*` |

Web sets an **HttpOnly** `zharfa_session` cookie via Next.js BFF routes under `/api/auth/*`. Nest also accepts the same token as cookie or `Authorization: Bearer`.

## Catalog surface

| Surface | Path |
|---------|------|
| Course catalog | `/courses` (search, category, offer filters, pagination) |
| Course detail | `/courses/[slug]` |
| Learning paths | `/paths`, `/paths/[slug]` |
| API catalog | `GET /catalog/categories`, `/catalog/courses`, `/catalog/courses/featured`, `/catalog/courses/:slug`, `/catalog/paths`, `/catalog/paths/:slug` |

Course state uses coherent enums: `CoursePublicationStatus` (`DRAFT` / `PUBLISHED` / `UNPUBLISHED` / `ARCHIVED`) × `CourseOfferKind` (`FREE` / `PAID` / `PRE_SALE` / `COMING_SOON`). Pricing uses Prisma `Decimal` (Toman).

## Commerce surface

| Surface | Path |
|---------|------|
| Course purchase | `/courses/[slug]/purchase` (gated; disabled when no usable gateway) |
| Payment pending / success / failure | `/payments/pending`, `/payments/success`, `/payments/failure` |
| Student order history | `/dashboard/orders` |
| API checkout | `GET /commerce/checkout/:slug`, `POST /commerce/checkout/start`, `POST /commerce/coupons/validate` |
| API orders | `GET /commerce/orders`, `GET /commerce/orders/:id` |
| Gateway callbacks | `GET /commerce/callbacks/zarinpal`, `GET\|POST /commerce/callbacks/aqayepardakht` |
| Admin gateway settings | `GET\|PATCH /commerce/admin/gateways` (OWNER) |

Adapters: **ZarinPal v4** (`payment.zarinpal.com` / sandbox) and **AqayePardakht v2** (`panel.aqayepardakht.ir/api/v2`). Orders become `PAID` only after server-side verify. Missing `ZARINPAL_MERCHANT_ID` / `AQAYE_PARDAKHT_PIN` → `IMPLEMENTED_BUT_CREDENTIALS_REQUIRED`.

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
| `pnpm db:seed` | Seed admin + students + catalog |
| `pnpm db:studio` | Prisma Studio |
| `pnpm --filter @zharfa/api test` | Identity + catalog state/pricing unit tests |
