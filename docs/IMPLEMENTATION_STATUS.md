# IMPLEMENTATION_STATUS

Living ledger for the Zharfa / EDU personal education platform. Update in place; do not regenerate from scratch.

| Feature area | Status | Notes |
|--------------|--------|-------|
| Phase 0 Figma audit | IMPLEMENTED | Project store + Figma `ecYEt09V8ZOGzG2sRd4cC1` |
| Phase 0 Repository audit | IMPLEMENTED | See [phase-0-repo-audit.md](./phase-0-repo-audit.md) |
| Workspace / Docker foundation | IN_PROGRESS | pnpm+turbo monorepo; compose Postgres/Redis/MinIO; health stubs (PR #1) |
| Design tokens in code | IMPLEMENTED | `@zharfa/ui` dark/light CSS vars, type scale, spacing/radius from Native assets |
| Design system components | IMPLEMENTED | Button, Field, Badge, Notice, Dialog, CourseCard (availability variants); RTL + a11y basics |
| Public web shell / home | IMPLEMENTED | Layout, nav, theme toggle, hero first viewport + featured courses from Figma copy |
| Identity / auth | NOT_STARTED | Login CTA is non-functional shell only |
| Courses / catalog | NOT_STARTED | Prisma `Course` + home featured cards use design copy only |
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
