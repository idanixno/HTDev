# Phase 0 — Repository audit (Zharfa / HTDev)

**Repo:** [idanixno/HTDev](https://github.com/idanixno/HTDev)  
**Audited:** 2026-11-06  
**Base at audit start:** `main` @ `bfe4ab3` — placeholder README only (`# HTDev`)

## Findings

| Area | Finding |
|------|---------|
| Prior application code | None — greenfield |
| Package manager | Not present → scaffold uses **pnpm** workspaces |
| Monorepo tooling | Not present → **Turborepo** |
| Frontend | Not present → `apps/web` Next.js App Router, `lang=fa` `dir=rtl` |
| Backend | Not present → `apps/api` NestJS |
| Jobs | Not present → `apps/worker` BullMQ + Redis |
| ORM / DB | Not present → Prisma + PostgreSQL in `packages/database` |
| Object storage | Not present → MinIO via docker-compose |
| Auth / payments / SpotPlayer | Absent (correct for greenfield); schema placeholders only — **no success stubs** |
| CI | None yet |
| Docs | None in repo at start |

## Decision

**Scaffold foundation** (Phase 1) rather than rewrite: empty tree, no modules to preserve.

## Target layout (post-scaffold)

```
apps/web          Next.js App Router (RTL shell + health)
apps/api          NestJS (health)
apps/worker       BullMQ worker (health HTTP stub)
packages/database Prisma schema + client
packages/ui       Zharfa dark/light CSS tokens (from Figma)
packages/config   Shared TS config helpers
docker-compose.yml  Postgres + Redis + MinIO
.env.example
SECURITY.md
docs/
```

## Figma alignment

Tokens sourced from file `ecYEt09V8ZOGzG2sRd4cC1` page `01 · Native assets` (dark/light role colors, Vazirmatn + JetBrains Mono). Full product screens remain later phases.

## Blockers

- Docker daemon may be unavailable in some Cloud Agent VMs; compose files are still committed for local Mac/dev use.
- Payment/SpotPlayer credentials intentionally unset until real merchant/API keys exist.
