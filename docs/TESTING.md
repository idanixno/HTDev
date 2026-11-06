# Testing

## Commands (local)

```bash
pnpm install
pnpm db:generate
pnpm --filter @zharfa/database build   # required before API vitest (CJS dist)
pnpm typecheck
pnpm lint
pnpm test                              # builds database, then API + worker Vitest
pnpm build                             # web + api + worker
```

API unit tests live under `apps/api/src/**/*.spec.ts` (Vitest). Worker currently has no unit files; `vitest` exits 0 with `passWithNoTests`.

There is **no** Playwright/Cypress E2E suite in-repo yet. End-to-end against real gateways/SpotPlayer/SMS is **blocked** without credentials (see README integration table).

## What Phase 10 verified in CI/agent environment

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm install` | PASS | |
| `pnpm db:generate` | PASS | |
| `pnpm typecheck` | PASS | all workspace packages |
| `pnpm lint` | PASS | web: ESLint next/core-web-vitals; api/worker: stub echo only |
| `pnpm test` (API) | PASS | 17 files / 72 tests |
| `pnpm test` (worker) | PASS | no test files (passWithNoTests) |
| `pnpm build` (database, api, worker, web) | PASS | |
| `pnpm docker:up` | BLOCKED | Docker CLI not available in this agent VM |
| `pnpm db:migrate` / `db:seed` | BLOCKED | no Postgres at `127.0.0.1:5432` without Compose |
| Live ZarinPal / AqayePardakht verify | BLOCKED | empty merchant credentials |
| Live SpotPlayer license create | BLOCKED | empty `SPOTPLAYER_API_KEY` |
| Real SMS / email delivery | BLOCKED | console adapters only |

## Mock hooks (tests only)

- `PAYMENT_MOCK_HOOKS=true` — unit/integration mock adapters; still requires explicit verify (browser return alone never marks PAID).
- `SPOTPLAYER_MOCK_HOOKS=true` — mock license create; never invents success without that call.
- Never enable mocks in production.

## Manual smoke (when Docker is available)

1. `pnpm docker:up && pnpm db:migrate && pnpm db:seed`
2. Start web/api/worker; hit health URLs.
3. Login as `admin` / `SEED_ADMIN_PASSWORD` → `/admin`.
4. Login as `sara` / `SEED_STUDENT_PASSWORD` → `/dashboard`, browse courses, open tickets.
5. Confirm paid checkout stays disabled (or returns credentials-required) when gateway env vars are empty.
