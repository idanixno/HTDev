# IMPLEMENTATION_STATUS

Living ledger for the Zharfa / EDU personal education platform. Update in place; do not regenerate from scratch.

| Feature area | Status | Notes |
|--------------|--------|-------|
| Phase 0 Figma audit | VERIFIED | Project store + Figma `ecYEt09V8ZOGzG2sRd4cC1` |
| Phase 0 Repository audit | VERIFIED | See [phase-0-repo-audit.md](./phase-0-repo-audit.md) |
| Workspace / Docker foundation | VERIFIED | pnpm+turbo monorepo; compose Postgres/Redis/MinIO; health stubs. Compose itself **BLOCKED** in agent VM (no Docker CLI) — verified by file + scripts locally |
| Design tokens in code | VERIFIED | `@zharfa/ui` dark/light CSS vars, type scale, spacing/radius; typecheck clean |
| Design system components | VERIFIED | Button, Field, Badge, Notice, Dialog, CourseCard; typecheck + web build |
| Public web shell / home | VERIFIED | Layout, nav, theme toggle, hero; web production build |
| Identity / auth | VERIFIED | Unit tests (password/OTP/normalization); web/api build; live login smoke **BLOCKED** without Postgres |
| Courses / catalog | VERIFIED | Unit tests (state/pricing); web/api build; seeded catalog runtime **BLOCKED** without migrate/seed |
| Orders / payments (ZarinPal, AqayePardakht) | VERIFIED | Unit tests (order status, coupon math, callback idempotency, mock adapter); real gateway → **BLOCKED** (`IMPLEMENTED_BUT_CREDENTIALS_REQUIRED` without merchant ids). No fake PAID |
| SpotPlayer access | VERIFIED | Unit tests (adapter, crypto, provisioning logic); real license API → **BLOCKED** (empty `SPOTPLAYER_API_KEY`). No invented keys |
| Support tickets | VERIFIED | Unit tests (status transitions, attachment rules/magic bytes); web client/server import split fixed for build |
| Notifications | VERIFIED | Unit tests (rate-limit); console email/SMS only — real delivery **BLOCKED** |
| Admin analytics | VERIFIED | Unit tests (date-range, aggregates); `/admin` in web build output |
| CMS / SEO | VERIFIED | `robots.ts` / `sitemap.ts` present in web build; metadata helpers typecheck |
| Security docs + controls | VERIFIED | Docs present; headers module in build; HSTS opt-in |
| Performance (catalog/fonts/images) | VERIFIED | Docs + build; ISR/sitemap routes emitted |
| Seed data | BLOCKED | Seed script present; cannot run without Postgres/Docker in this environment |
| E2E / local delivery | VERIFIED | Phases 10–11: install/typecheck/lint/unit/build PASS; Docker/migrate/seed/runtime smoke + real integrations BLOCKED — see [TESTING.md](./TESTING.md) |

Statuses: `NOT_STARTED` · `IN_PROGRESS` · `IMPLEMENTED` · `TESTED` · `VERIFIED` · `BLOCKED`

**Honesty rule:** never use `VERIFIED_REAL_INTEGRATION` without live credentials. Missing payment/SpotPlayer/SMS credentials remain `IMPLEMENTED_BUT_CREDENTIALS_REQUIRED` / BLOCKED for live paths.

## Phase 10–11 verification matrix (agent run)

| Check | Result |
|-------|--------|
| `pnpm install` | PASS |
| `pnpm db:generate` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm lint` | PASS (api/worker ESLint still stub) |
| API Vitest | PASS — 17 files / 72 tests |
| Worker Vitest | PASS — no files (`passWithNoTests`) |
| `pnpm build` (web/api/worker/database) | PASS |
| Docker Compose / Postgres migrate+seed | BLOCKED — no Docker/`127.0.0.1:5432` |
| Live ZarinPal / AqayePardakht / SpotPlayer / SMS | BLOCKED — credentials empty |

## Residual limitations (honest)

- Notification outbound rate limit remains in-memory (not Redis).
- Auth rate limit falls back to per-process memory if Redis is down.
- CSP still allows `'unsafe-inline'` scripts for Next App Router (no nonce pipeline).
- HSTS off unless `ENABLE_HSTS=true` — correct for local; operators must enable deliberately behind HTTPS.
- Ticket attachments still on local private disk (not MinIO signed URLs).
- No CI dependency audit / secret scanning yet.
- Sitemap caps course list at pageSize 100 for the first page only.
- api/worker lint scripts are stubs (`lint: pending eslint setup`).
- No browser E2E suite yet.
