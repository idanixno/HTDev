# Deployment

## Current scope

Zharfa is **local-first**. Production hosting, TLS termination, managed Postgres/Redis, secret managers, and CI deploy pipelines are **out of scope** for Phases 10–11. This document describes what exists today and what operators must supply later.

## Local runtime topology

```
browser → apps/web (:3000)
            └─ BFF /api/* → apps/api (:4000)
apps/worker (:4001 health) ← Redis BullMQ ← apps/api enqueue
apps/api + worker → PostgreSQL (:5432)
optional: MinIO (:9000 / :9001) for future object storage
```

Compose file: [`docker-compose.yml`](../docker-compose.yml) (Postgres 16, Redis 7, MinIO).

## Environment

Copy [`.env.example`](../.env.example) → `.env` at the repo root. Prisma scripts (`db:generate`, `db:migrate`, `db:seed`, `db:studio`) load that file via `dotenv-cli`.

Critical groups:

| Group | Keys | Notes |
|-------|------|-------|
| Origins / SEO | `WEB_ORIGIN`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, `API_INTERNAL_URL`, `API_PUBLIC_URL` | Local defaults use localhost |
| Data | `DATABASE_URL`, `REDIS_URL`, `S3_*` | Compose defaults match `.env.example` |
| Auth | `SESSION_SECRET`, `OTP_PEPPER`, `AUTH_RATE_*` | Change before any shared host |
| Seed | `SEED_ADMIN_PASSWORD`, `SEED_STUDENT_PASSWORD` | Demo only |
| Payments | `ZARINPAL_*`, `AQAYE_PARDAKHT_*`, `PAYMENT_MOCK_HOOKS` | Empty = credentials required |
| SpotPlayer | `SPOTPLAYER_*` | Empty = credentials required |
| Security | `ENABLE_HSTS` | Keep `false` on local HTTP |
| Tickets / notify | `TICKET_ATTACHMENT_ROOT`, `NOTIFY_RATE_*` | Attachments on private local disk |

## Suggested future production checklist (not implemented)

1. Managed PostgreSQL + Redis; run `pnpm db:migrate` as `migrate:deploy` in release job.
2. Set strong `SESSION_SECRET` / `OTP_PEPPER`; disable all `*_MOCK_HOOKS`.
3. Supply real ZarinPal / AqayePardakht / SpotPlayer credentials; re-verify payment + license paths manually.
4. Replace console email/SMS with a real provider; store secrets outside git.
5. Terminate TLS; set `ENABLE_HSTS=true` only behind HTTPS.
6. Harden CSP (remove `'unsafe-inline'` when Next nonce pipeline exists).
7. Move ticket attachments to signed object storage (MinIO/S3).
8. Add CI: typecheck, lint, unit tests, dependency audit, secret scanning.

## What not to do

- Do not invent successful payments or SpotPlayer licenses in any environment.
- Do not claim production readiness solely because `pnpm build` passes.
- Do not commit real `.env` secrets.
