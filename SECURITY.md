# Security — Zharfa / HTDev

Local-first education platform. This document tracks security posture for Phase 1 foundation and later modules.

## Principles

- **No fake payment success.** ZarinPal and AqayePardakht adapters must only mark an order `PAID` after a verified gateway **verify** call (not browser return alone). Missing credentials → `IMPLEMENTED_BUT_CREDENTIALS_REQUIRED`; checkout disables paid purchase. `PAYMENT_MOCK_HOOKS` is test-only and still requires explicit verify.
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

## Auth (Phase 3)

- Passwords: **Argon2id** (`argon2` package).
- Sessions: opaque random token in **HttpOnly** `zharfa_session` cookie; only SHA-256 hash stored.
- OTP recovery: SHA-256(pepper + code), expiry, single-use, attempt cap; response shape avoids account enumeration.
- Messaging: `MessagingProvider` interface + console/dev adapter — no real SMS/email credentials required locally.
- Rate limiting: in-memory stub per IP + bucket — replace with Redis before production.

## Checklist (foundation)

- [x] `.env` gitignored; `.env.example` documents required vars without real secrets
- [x] Prisma models for orders/licenses include explicit non-success default statuses
- [x] Health endpoints do not call payment/SpotPlayer APIs
- [x] Auth (session cookies, Argon2id, OTP hash, rate-limit stub)
- [ ] Redis-backed rate limits / session store — later hardening
- [x] Payment adapters (ZarinPal v4 + AqayePardakht v2) with server-side verify + callback idempotency
- [ ] Production merchant credentials + IP allowlists — operator setup
- [ ] Object storage signed URLs / private buckets — later phase
- [ ] Dependency audit / CI secret scanning — later phase

## Reporting

For security issues in this repository, contact the repository owner privately. Do not open public issues that include secrets or exploit details.
