# IMPLEMENTATION_STATUS

Living ledger for the Zharfa / EDU personal education platform. Update in place; do not regenerate from scratch.

| Feature area | Status | Notes |
|--------------|--------|-------|
| Phase 0 Figma audit | IMPLEMENTED | Project store + Figma `ecYEt09V8ZOGzG2sRd4cC1` |
| Phase 0 Repository audit | IMPLEMENTED | See [phase-0-repo-audit.md](./phase-0-repo-audit.md) |
| Workspace / Docker foundation | IN_PROGRESS | pnpm+turbo monorepo; compose Postgres/Redis/MinIO; health stubs (PR #1) |
| Design tokens in code | IMPLEMENTED | `@zharfa/ui` dark/light CSS vars, type scale, spacing/radius from Native assets |
| Design system components | IMPLEMENTED | Button, Field, Badge, Notice (+error), Dialog, CourseCard; RTL + a11y basics |
| Public web shell / home | IMPLEMENTED | Layout, nav, theme toggle, hero first viewport + featured courses from Figma copy |
| Identity / auth | IMPLEMENTED | Prisma User/Session/OtpChallenge; Nest Identity (Argon2id, OTP, HttpOnly session); web login/register/recover + gated `/dashboard`; console messaging adapters; rate-limit stub |
| Courses / catalog | NOT_STARTED | Prisma `Course` + home featured cards use design copy only |
| Orders / payments (ZarinPal, AqayePardakht) | NOT_STARTED | Schema + SECURITY constraints; no fake success |
| SpotPlayer access | NOT_STARTED | License model defaults to `pending`; no fake success |
| Support tickets | NOT_STARTED | Prisma `Ticket` scaffold only |
| Notifications | NOT_STARTED | |
| Admin analytics | NOT_STARTED | |
| CMS / SEO | NOT_STARTED | |
| Security docs + controls | IN_PROGRESS | `SECURITY.md`; auth hashing/sessions/OTP hashing in place; Redis rate-limit still stub |
| Seed data | IMPLEMENTED | `pnpm db:seed` — 1 OWNER + 4 STUDENTS; passwords via `SEED_*_PASSWORD` |
| E2E / local delivery | NOT_STARTED | API unit tests for normalization / Argon2id / OTP hash semantics |

Statuses: `NOT_STARTED` · `IN_PROGRESS` · `IMPLEMENTED` · `TESTED` · `VERIFIED` · `BLOCKED`
