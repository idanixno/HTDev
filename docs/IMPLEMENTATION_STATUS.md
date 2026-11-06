# IMPLEMENTATION_STATUS

Living ledger for the Zharfa / EDU personal education platform. Update in place; do not regenerate from scratch.

| Feature area | Status | Notes |
|--------------|--------|-------|
| Phase 0 Figma audit | IMPLEMENTED | Project store + Figma `ecYEt09V8ZOGzG2sRd4cC1` |
| Phase 0 Repository audit | IMPLEMENTED | See [phase-0-repo-audit.md](./phase-0-repo-audit.md) |
| Workspace / Docker foundation | IN_PROGRESS | pnpm+turbo monorepo; compose Postgres/Redis/MinIO; health stubs |
| Design tokens in code | IN_PROGRESS | `@zharfa/ui` dark/light CSS vars from Figma foundations |
| Identity / auth | NOT_STARTED | |
| Courses / catalog | NOT_STARTED | Prisma `Course` model scaffold only |
| Orders / payments (ZarinPal, AqayePardakht) | NOT_STARTED | Schema + SECURITY constraints; no fake success |
| SpotPlayer access | NOT_STARTED | License model defaults to `pending`; no fake success |
| Support tickets | NOT_STARTED | Prisma `Ticket` scaffold only |
| Notifications | NOT_STARTED | |
| Admin analytics | NOT_STARTED | |
| CMS / SEO | NOT_STARTED | |
| Security docs + controls | IN_PROGRESS | `SECURITY.md` foundation checklist |
| Seed data | NOT_STARTED | |
| E2E / local delivery | NOT_STARTED | |

Statuses: `NOT_STARTED` · `IN_PROGRESS` · `IMPLEMENTED` · `TESTED` · `VERIFIED` · `BLOCKED`
