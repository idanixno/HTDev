# IMPLEMENTATION_STATUS

Living ledger for the Zharfa / EDU personal education platform. Update in place; do not regenerate from scratch.

| Feature area | Status | Notes |
|--------------|--------|-------|
| Phase 0 Figma audit | IMPLEMENTED | Project store + Figma `ecYEt09V8ZOGzG2sRd4cC1` |
| Phase 0 Repository audit | IMPLEMENTED | See [phase-0-repo-audit.md](./phase-0-repo-audit.md) |
| Workspace / Docker foundation | IN_PROGRESS | pnpm+turbo monorepo; compose Postgres/Redis/MinIO; health stubs (PR #1) |
| Design tokens in code | IMPLEMENTED | `@zharfa/ui` dark/light CSS vars, type scale, spacing/radius from Native assets |
| Design system components | IMPLEMENTED | Button, Field, Badge, Notice (+error), Dialog, CourseCard; RTL + a11y basics |
| Public web shell / home | IMPLEMENTED | Layout, nav, theme toggle, hero; featured courses from catalog API seed |
| Identity / auth | IMPLEMENTED | Prisma User/Session/OtpChallenge; Nest Identity (Argon2id, OTP, HttpOnly session); web login/register/recover + gated `/dashboard`; console messaging adapters; rate-limit Redis-or-memory; BFF Origin check |
| Courses / catalog | IMPLEMENTED | Prisma Category/Course (publication+offer enums)/CurriculumModule/Lesson/LearningPath; Nest `/catalog/*` list-filter-search-pagination + detail + paths; web `/courses`, `/courses/[slug]`, `/paths`, `/paths/[slug]`; local artwork placeholders; unit tests for state/pricing helpers |
| Orders / payments (ZarinPal, AqayePardakht) | IMPLEMENTED | Prisma Order/PaymentTransaction/Coupon/GatewaySetting (Decimal Toman); Nest checkout + coupon validate + ZarinPal/AqayePardakht adapters + callback verify/idempotency + admin gateway flags; web purchase + pending/success/failure + order history; missing creds → `IMPLEMENTED_BUT_CREDENTIALS_REQUIRED` (paid purchase disabled); no fake PAID |
| SpotPlayer access | IMPLEMENTED | Nest SpotPlayer module + official license adapter; course↔SpotPlayer mapping; env/DB encrypted API key (masked in responses); BullMQ `access-provisioning` after PAID / free grant; separate `SpotPlayerLicenseStatus` from payment; admin config/diagnostics + student `/dashboard/access`; free-course path; retries; missing key → `IMPLEMENTED_BUT_CREDENTIALS_REQUIRED`; no invented license keys |
| Support tickets | IMPLEMENTED | Prisma Ticket + Message + Attachment; statuses OPEN/IN_PROGRESS/WAITING_FOR_USER/RESOLVED/CLOSED with enforced transitions; Nest tickets API (student create/thread/reply + admin list/filters/reply/status); private attachment store (allowlist MIME/size + magic bytes, opaque keys, auth download); optional Telegram ref only as supplementary; web `/dashboard/tickets`, `/dashboard/tickets/new`, `/dashboard/admin/tickets` |
| Notifications | IMPLEMENTED | Event-driven Nest module; templates; channels IN_APP + console email/SMS adapters; delivery status + rate-limit stub; wired to registration, recovery/password change, order paid/failed, SpotPlayer provision success/fail, ticket create/reply/status; web `/dashboard/notifications` |
| Admin analytics | IMPLEMENTED | OWNER-only `/admin` RTL shell; Nest `/admin/*` OwnerGuard; dashboard aggregates + groupBy status breakdowns (no N+1); SVG charts; modules for courses/categories/orders/customers/tickets/coupons/payments/SpotPlayer/CMS/activity |
| CMS / SEO | IMPLEMENTED | CMS home/FAQ admin API/UI; public SEO metadata (title/description/OG/canonical) on home/courses/paths; `robots.ts` + `sitemap.ts` public-only; private routes noindex + X-Robots-Tag |
| Security docs + controls | IMPLEMENTED | `SECURITY.md` + `docs/security/THREAT_MODEL.md` + `SECURITY_CONTROLS.md` describe actual controls; security headers (CSP-friendly); opt-in HSTS (`ENABLE_HSTS`); session/CSRF review; upload magic bytes; Redis-or-memory auth rate limit |
| Performance (catalog/fonts/images) | IMPLEMENTED | Catalog ISR 60s; Vazirmatn preload + swap; cover `<img>` lazy/priority; analytics groupBy; see [performance/PUBLIC_CATALOG_CACHING.md](./performance/PUBLIC_CATALOG_CACHING.md) |
| Seed data | IMPLEMENTED | Admin + 4 students + catalog + coupons + gateway settings + SpotPlayer settings/mappings + sample PENDING/FAILED orders + historical PAID analytics fixtures (seed-only) + tickets/notifications + CMS home/FAQ + activity log samples; no SUCCEEDED SpotPlayer licenses |
| E2E / local delivery | NOT_STARTED | API unit tests: identity + catalog + commerce + SpotPlayer + ticket transitions + notify rate-limit + attachment rules/magic bytes + analytics date-range/aggregates |

Statuses: `NOT_STARTED` · `IN_PROGRESS` · `IMPLEMENTED` · `TESTED` · `VERIFIED` · `BLOCKED`

## Phase 9 residual limitations (honest)

- Notification outbound rate limit remains in-memory (not Redis).
- Auth rate limit falls back to per-process memory if Redis is down.
- CSP still allows `'unsafe-inline'` scripts for Next App Router (no nonce pipeline).
- HSTS off unless `ENABLE_HSTS=true` — correct for local; operators must enable deliberately behind HTTPS.
- Ticket attachments still on local private disk (not MinIO signed URLs).
- No CI dependency audit / secret scanning yet.
- Sitemap caps course list at pageSize 100 for the first page only.
