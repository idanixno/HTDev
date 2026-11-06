# Security — Zharfa / HTDev

Local-first personal education platform. This document describes the **implemented** security posture (Phases 1–9), not aspirational production checklists.

Deeper detail:

- [docs/security/THREAT_MODEL.md](./docs/security/THREAT_MODEL.md)
- [docs/security/SECURITY_CONTROLS.md](./docs/security/SECURITY_CONTROLS.md)

## Principles

- **No fake payment success.** ZarinPal and AqayePardakht adapters mark an order `PAID` only after a verified gateway **verify** call (not browser return alone). Missing credentials → `IMPLEMENTED_BUT_CREDENTIALS_REQUIRED`; checkout disables paid purchase. `PAYMENT_MOCK_HOOKS` is test-only and still requires explicit verify.
- **No fake SpotPlayer success.** License rows stay `PENDING`/`QUEUED`/`FAILED` until the real SpotPlayer API returns `_id` + `key`. Never invent license keys in seeds, health checks, or UI. Responses only show a masked key.
- **Secrets stay out of git.** Use `.env` (gitignored) from `.env.example`. Rotate any credential that appears in chat or logs.
- **Least privilege.** Owner vs student roles are enforced in the API (`OwnerGuard`); student routes must not expose admin analytics or unpublished course mutation.
- **RTL / public surface.** Public pages avoid leaking PII; student dashboard and admin require authenticated session. Private routes are `noindex` + disallowed in `robots.txt`.

## Local stack

| Service | Default exposure | Notes |
|---------|------------------|-------|
| Postgres | `localhost:5432` | Default compose password is for local only |
| Redis | `localhost:6379` | No auth in compose — bind to loopback; used by BullMQ and optional auth rate limits |
| MinIO | `9000` / console `9001` | Dev credentials in `.env.example` only (ticket attachments still use local private root) |
| Web | `3000` | Next App Router + middleware security headers |
| API | `4000` | NestJS + security header middleware |
| Worker health | `4001` | BullMQ process health stub |

## Auth

- Passwords: **Argon2id**.
- Sessions: opaque random token in **HttpOnly** `zharfa_session` cookie; only SHA-256 hash stored; SameSite=Lax; Secure when `NODE_ENV=production`.
- OTP recovery: SHA-256(pepper + code), expiry, single-use, attempt cap; response shape avoids account enumeration.
- CSRF: SameSite=Lax primary; auth BFF POSTs also check Origin/Referer (`apps/web/lib/csrf.ts`).
- Rate limiting: per IP + bucket; uses Redis when `REDIS_URL` connects, otherwise in-memory fallback (documented as not multi-instance safe).
- Messaging: `MessagingProvider` + console/dev adapter — no real SMS/email credentials required locally.

## HTTP hardening (Phase 9)

- Web + API send `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, and a CSP baseline.
- **HSTS is opt-in** via `ENABLE_HSTS=true`. It is never enabled solely because `NODE_ENV=production`, so local HTTP development is not broken.
- Next `poweredByHeader: false`.

## Uploads

Ticket attachments: MIME allowlist, 5 MiB cap, filename sanitization, opaque storage keys, magic-byte check vs declared type, private root with path-traversal rejection, auth-only download.

## Crawl / SEO privacy

- `robots.txt` and `sitemap.xml` list public catalog surfaces only.
- Admin, dashboard, auth, payments, design-system, and API routes: metadata `noindex` + `X-Robots-Tag`.

## Checklist

- [x] `.env` gitignored; `.env.example` documents required vars without real secrets
- [x] Prisma models for orders/licenses include explicit non-success default statuses
- [x] Health endpoints do not call payment/SpotPlayer APIs
- [x] Auth (session cookies, Argon2id, OTP hash, rate limit with Redis-or-memory)
- [x] Payment adapters with server-side verify + callback idempotency
- [x] SpotPlayer license adapter + BullMQ AccessProvisioning (no invented keys; credentials masked)
- [x] Ticket attachments: MIME/size/magic bytes, opaque keys, no path traversal, auth-only download
- [x] Notification console adapters + outbound rate-limit stub
- [x] Security headers + opt-in HSTS; private route noindex; robots/sitemap public-only
- [x] Threat model + controls docs under `docs/security/`
- [ ] Notification rate limits Redis-backed — residual
- [ ] Production merchant / SpotPlayer credentials + IP allowlists — operator setup
- [ ] Object storage signed URLs / private buckets — later (attachments currently local private root)
- [ ] Dependency audit / CI secret scanning — later
- [ ] CSP nonces (replace `'unsafe-inline'` scripts) — later

## Reporting

For security issues in this repository, contact the repository owner privately. Do not open public issues that include secrets or exploit details.
