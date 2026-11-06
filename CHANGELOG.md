# Changelog

All notable Zharfa / HTDev delivery phases. Dates are approximate to PR merge / agent delivery order.

## [Unreleased] — Phases 10–11: verification & local delivery

- Full local verification matrix: install, typecheck, lint, unit tests, builds.
- README polish: exact setup, compose, migrate/seed, URLs, demo credentials, integration credential gaps with honest status labels.
- `docs/TESTING.md` + `docs/DEPLOYMENT.md` stubs reflecting reality (Docker/Postgres required for migrate/seed/runtime).
- Build fix: client components no longer import server-only `next/headers` session helpers (ticket / notification / SpotPlayer shared modules).
- Vitest: CommonJS `@zharfa/database` resolves under Vite 7; worker tests `passWithNoTests`.
- Prisma scripts load root `.env` via `dotenv-cli`.
- Web ESLint (`eslint-config-next`) so `pnpm lint` is non-interactive.

## Phase 9 — Security, SEO, performance

- `SECURITY.md`, threat model, security controls docs.
- CSP-friendly headers, opt-in HSTS, session/CSRF review, upload magic bytes.
- Public SEO metadata, `robots.ts` / `sitemap.ts`, private routes noindex.
- Catalog ISR, font preload/swap, image priority/lazy, analytics groupBy.

## Phase 8 — Admin analytics & modules

- OWNER-only `/admin` RTL shell + Nest `/admin/*` with OwnerGuard.
- Real DB aggregates + SVG charts; courses, categories, orders, customers, tickets, coupons, payments, SpotPlayer, CMS, activity.

## Phase 7 — Support tickets & notifications

- Ticket + message + attachment model with enforced status transitions.
- Private attachment store; student/admin UIs.
- Event notifications (IN_APP + console email/SMS) with delivery rows and rate limits.

## Phase 6 — SpotPlayer access

- License adapter + course mappings; BullMQ provisioning after PAID / free grant.
- Separate license status from payment; admin + student UIs; no invented keys.

## Phase 5 — Commerce

- Orders, coupons, ZarinPal + AqayePardakht adapters, verify/idempotency.
- Honest payment pages; missing credentials → `IMPLEMENTED_BUT_CREDENTIALS_REQUIRED`.

## Phase 4 — Education core / catalog

- Categories, courses (publication × offer enums), curriculum, paths; public catalog UI + seed artwork.

## Phase 3 — Identity / student accounts

- Argon2id auth, HttpOnly sessions, recovery OTP, BFF CSRF Origin check, gated dashboard.

## Phase 2 — Design system & public shell

- `@zharfa/ui` tokens + components; RTL home/shell; theme toggle.

## Phase 1 / 0 — Foundation & audits

- pnpm + turbo monorepo; Docker Compose Postgres/Redis/MinIO; health stubs.
- Figma + repository audits.
