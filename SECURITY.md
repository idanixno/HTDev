# Security — Zharfa / HTDev

Local-first education platform. This document tracks security posture for Phase 1 foundation and later modules.

## Principles

- **No fake payment success.** ZarinPal and AqayePardakht adapters must only mark an order `PAID` after a verified gateway callback/signature. Local stubs return `pending` / `failed`, never fabricated `PAID`.
- **No fake SpotPlayer success.** License rows stay `pending` until the real SpotPlayer API confirms issuance. Never invent license keys in seeds or health checks.
- **Secrets stay out of git.** Use `.env` (gitignored) from `.env.example`. Rotate any credential that appears in chat or logs.
- **Least privilege.** Owner vs student roles are enforced in the API; student routes must not expose admin analytics or unpublished course mutation.
- **RTL / public surface.** Public pages avoid leaking PII; student dashboard requires authenticated session.

## Local stack

| Service | Default exposure | Notes |
|---------|------------------|-------|
| Postgres | `localhost:5432` | Default compose password is for local only |
| Redis | `localhost:6379` | No auth in compose — bind to loopback |
| MinIO | `9000` / console `9001` | Dev credentials in `.env.example` only |
| Web | `3000` | Next App Router |
| API | `4000` | NestJS |
| Worker health | `4001` | BullMQ process health stub |

## Checklist (foundation)

- [x] `.env` gitignored; `.env.example` documents required vars without real secrets
- [x] Prisma models for orders/licenses include explicit non-success default statuses
- [x] Health endpoints do not call payment/SpotPlayer APIs
- [ ] Auth (JWT/session hardening, password hashing, rate limits) — later phase
- [ ] Webhook signature verification for payment providers — later phase
- [ ] Object storage signed URLs / private buckets — later phase
- [ ] Dependency audit / CI secret scanning — later phase

## Reporting

For security issues in this repository, contact the repository owner privately. Do not open public issues that include secrets or exploit details.
