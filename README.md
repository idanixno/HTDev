# ژرفا / Zharfa (HTDev)

Personal education platform (one instructor). Persian RTL primary. Monorepo: Next.js web, NestJS API, BullMQ worker, Prisma + PostgreSQL, Redis, MinIO.

Figma: [EDU / Zharfa](https://www.figma.com/design/ecYEt09V8ZOGzG2sRd4cC1)

## Stack

| App / package | Role |
|---------------|------|
| `apps/web` | Next.js App Router, RTL public shell, auth BFF, catalog/paths, student dashboard, OWNER `/admin` |
| `apps/api` | NestJS HTTP API (Identity, Catalog, Commerce, SpotPlayer, Tickets, Notifications, Admin) |
| `apps/worker` | BullMQ jobs (`access-provisioning`) |
| `packages/database` | Prisma schema + client + seed |
| `packages/ui` | Zharfa design system (`@zharfa/ui`) |
| `packages/config` | Shared TS configs |

## Prerequisites

- Node.js ≥ 20
- [pnpm](https://pnpm.io) 10.x (`corepack enable && corepack prepare pnpm@10.33.4 --activate`)
- Docker + Docker Compose (Postgres 16, Redis 7, MinIO)

## Local setup (exact)

```bash
# 1. Install
pnpm install

# 2. Environment (root .env — Prisma scripts load it via dotenv-cli)
cp .env.example .env

# 3. Infrastructure
pnpm docker:up
# wait until healthy: docker compose ps
# expected: zharfa-postgres, zharfa-redis, zharfa-minio

# 4. Prisma client + migrate + seed
pnpm db:generate
pnpm db:migrate          # prisma migrate dev (uses root .env DATABASE_URL)
pnpm db:seed             # demo users, catalog, coupons, sample orders/tickets

# 5. Dev processes (separate terminals, or turbo)
pnpm --filter @zharfa/web dev      # http://localhost:3000
pnpm --filter @zharfa/api dev      # http://localhost:4000/health
pnpm --filter @zharfa/worker dev   # http://localhost:4001/health
```

All apps via Turbo:

```bash
pnpm dev
```

Production-ish local builds:

```bash
pnpm build
pnpm --filter @zharfa/web start
pnpm --filter @zharfa/api start
pnpm --filter @zharfa/worker start
```

## Local URLs

| Surface | URL |
|---------|-----|
| Web (public) | http://localhost:3000 |
| Student dashboard | http://localhost:3000/dashboard |
| Admin (OWNER) | http://localhost:3000/admin |
| API health | http://localhost:4000/health |
| Worker health | http://localhost:4001/health |
| Web health | http://localhost:3000/api/health |
| MinIO API / console | http://localhost:9000 · http://localhost:9001 |
| Postgres | `127.0.0.1:5432` (`zharfa` / `zharfa` / db `zharfa`) |
| Redis | `redis://127.0.0.1:6379` |

## Demo accounts (seed)

Passwords are **env-configurable** (see `.env.example`). Defaults are for local demo only — change before any shared environment.

| Role | Username | Email | Phone | Env var | Default (local only) |
|------|----------|-------|-------|---------|----------------------|
| OWNER (admin) | `admin` | `admin@zharfa.local` | `09120000000` | `SEED_ADMIN_PASSWORD` | `ChangeMeAdmin!23` |
| STUDENT | `sara` | `sara@example.com` | `09121111111` | `SEED_STUDENT_PASSWORD` | `ChangeMeStudent!23` |
| STUDENT | `reza` | `reza@example.com` | `09122222222` | same | same |
| STUDENT | `niloofar` | `niloofar@example.com` | `09123333333` | same | same |
| STUDENT | `amir` | `amir@example.com` | — | same | same |

Login accepts **username, email, or phone** + password.

- Admin panel: sign in as `admin` → http://localhost:3000/admin
- Student flows: sign in as `sara` (or peers) → http://localhost:3000/dashboard
- Recovery OTP is logged by the **console** email/SMS provider in API logs (no real SMS/email until credentials exist)

Seed also creates categories, courses, curriculum, learning paths, coupons, gateway/SpotPlayer settings rows, sample PENDING/FAILED orders, historical PAID analytics fixtures (seed-only), tickets, notifications, CMS FAQ, and activity log samples. Adapters **never** invent runtime `PAID` or SUCCEEDED SpotPlayer licenses.

## Integration credential status (honest)

| Integration | Env vars | Local status | Notes |
|-------------|----------|--------------|-------|
| ZarinPal | `ZARINPAL_MERCHANT_ID`, `ZARINPAL_SANDBOX` | `IMPLEMENTED_BUT_CREDENTIALS_REQUIRED` when empty | No fake PAID; paid purchase UI disabled without merchant id |
| AqayePardakht | `AQAYE_PARDAKHT_PIN`, `AQAYE_PARDAKHT_SANDBOX` | Sandbox-ready with official pin `sandbox` when PIN empty + sandbox on; live needs real PIN | Same verify/idempotency rules; startpay `/startpay/sandbox/{transid}` in sandbox |
| SpotPlayer | `SPOTPLAYER_API_KEY`, `SPOTPLAYER_LICENSE_ENDPOINT` | `IMPLEMENTED_BUT_CREDENTIALS_REQUIRED` when empty | Payment PAID ≠ license SUCCEEDED; no invented keys |
| Email / SMS | (console adapters only) | Console provider | OTP + notifications print to API logs; not a real MTA/SMS gateway |
| Payment/SpotPlayer mocks | `PAYMENT_MOCK_HOOKS`, `SPOTPLAYER_MOCK_*` | Unit/test only | **Never** enable in production; mocks still require explicit verify/create calls |

Do **not** claim `VERIFIED_REAL_INTEGRATION` without live merchant/SpotPlayer/SMS credentials.

## Auth / catalog / commerce surfaces

| Surface | Path |
|---------|------|
| Login / register / recover | `/login` · `/register` · `/recover` |
| Student dashboard | `/dashboard` |
| Admin shell (OWNER) | `/admin` (+ courses, orders, tickets, payments, SpotPlayer, CMS, …) |
| Courses / paths / journal | `/courses`, `/courses/[slug]`, `/paths`, `/journal` |
| FAQ and terms | `/faq`, `/terms` |
| Purchase + payment pages | `/courses/[slug]/purchase`, `/payments/{pending,success,failure}` |
| Student orders / access / tickets / notifications / security | `/dashboard/orders`, `/dashboard/access`, `/dashboard/tickets`, `/dashboard/notifications`, `/dashboard/account` |
| API identity | `POST /identity/register\|login\|logout`, `GET /identity/me`, recover routes |
| API catalog | `GET /catalog/*` |
| API commerce | checkout, coupons, orders, gateway callbacks |
| API SpotPlayer / tickets / notifications / admin | `/spotplayer/*`, `/tickets/*`, `/notifications/*`, `/admin/*` |

Web sets an **HttpOnly** `zharfa_session` cookie via Next.js BFF routes under `/api/auth/*`. Nest accepts cookie or `Authorization: Bearer`.

## Important product constraints

- Currency display: **Toman**
- Payments: ZarinPal + AqayePardakht only — **no fabricated payment success**
- Protected video: SpotPlayer — **no fake license success**
- Not a multi-instructor marketplace; no custom video hosting
- SMS/email: interface + **console/dev provider** until real credentials exist

## Docs

- [`docs/IMPLEMENTATION_STATUS.md`](./docs/IMPLEMENTATION_STATUS.md) — living feature ledger (VERIFIED / BLOCKED)
- [`docs/TESTING.md`](./docs/TESTING.md) — how to run checks; what this environment verified
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — local-first notes (no production deploy required now)
- [`CHANGELOG.md`](./CHANGELOG.md) — phase summary
- [`SECURITY.md`](./SECURITY.md) — security posture
- [`docs/security/`](./docs/security/) · [`docs/performance/`](./docs/performance/)

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm install` | Install workspace deps |
| `pnpm dev` | Turbo dev for all packages |
| `pnpm build` | Build database → api / worker / web |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm lint` | Lint (web: ESLint via next lint; api/worker: stub pending full ESLint) |
| `pnpm test` | Build `@zharfa/database` then API + worker Vitest |
| `pnpm docker:up` / `docker:down` / `docker:ps` | Compose infra |
| `pnpm db:generate` | Prisma generate (root `.env`) |
| `pnpm db:migrate` | Prisma migrate dev |
| `pnpm db:seed` | Seed admin + students + catalog + fixtures |
| `pnpm db:studio` | Prisma Studio |
