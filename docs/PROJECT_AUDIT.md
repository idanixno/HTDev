# Project audit — ژرفا

Audited against the running monorepo (Next.js web, NestJS API, BullMQ worker, Prisma/Postgres) and the public product shape of an educational catalog. Mongard (`https://www.mongard.ir/`) was used only as a journey reference: discover, evaluate a course, follow a path, buy, then return to access. Branding, layout, and copy were not copied.

This audit distinguishes implemented behavior from pages that only looked finished.

## Architecture

| Piece | Role | State |
| --- | --- | --- |
| `apps/web` | RTL public site, BFF auth, student and owner UI | Working shell; several destinations were missing |
| `apps/api` | Identity, catalog, commerce, SpotPlayer, tickets, notifications, admin | Working modules; course write API had no UI |
| `apps/worker` | SpotPlayer provisioning queue | Present; live license still credential-gated |
| `packages/database` | Prisma schema, migrations, seed | Solid domain model; journal was absent |
| `packages/ui` | Tokens, Button, Field, Badge, Notice, Dialog, CourseCard | Coherent but small |
| Payments | ZarinPal + AqayePardakht, server verify, idempotent callbacks | Implemented; live PAID requires merchant credentials |
| SpotPlayer | License adapter separate from payment status | Implemented; success is never faked |

Roles are only `STUDENT` and `OWNER`. There is no instructor marketplace.

## Route inventory (before this pass)

Public routes that existed: `/`, `/courses`, `/courses/[slug]`, `/courses/[slug]/purchase`, `/paths`, `/paths/[slug]`, auth, payment result pages.

Dead or unfinished:

- Header linked to `/about` with no page.
- No footer, so FAQ, contact, terms, privacy, and refunds were unreachable.
- Desktop nav hid below 1100px with no replacement menu.
- No 404/error pages, no maintenance switch, student hitting `/admin` was silently sent to the dashboard.
- No journal.
- Student account had no password change.
- Admin course, category, and curriculum screens were read-only even though course/category write APIs existed. Curriculum and lessons had no API.

## What already worked

- Register, login, logout, OTP recovery (console email/SMS).
- Catalog search, category, offer filter, pagination.
- Course detail with modules when the API is up.
- Checkout creates an order and only marks PAID after gateway verify.
- Free enrollment does not use a gateway.
- Student orders, SpotPlayer access status, tickets, notifications.
- Owner analytics from the database, gateway flags, SpotPlayer settings, coupons, CMS FAQ, activity log.
- HttpOnly session cookie, owner guard, security headers, sitemap/robots for private areas.

## Deficiencies called out by the product brief

| Area | Finding | Priority |
| --- | --- | --- |
| Information architecture | Dead about link, no legal/support pages, no mobile nav, no footer | P0 |
| Catalog editing | Owner could not create or edit a course, category, or lesson from the UI | P0 |
| Course page | No related courses, preview list, breadcrumbs, or purchase trust copy in plain language | P1 |
| Discovery | No level filter or sort | P1 |
| Journal | No model, no public reading experience | P1 |
| Account | No authenticated password change; dashboard had no section nav | P1 |
| Learning-path admin | Paths are seeded and public, but there is still no owner editor | P1 |
| Profile fields | Display name, email, and phone cannot be edited after registration | P2 |
| Lesson rename | Create/delete exists; inline rename is API-only | P2 |
| Design system | Tokens existed; many pages still share one card rhythm. Not every admin table was recomposed | P2 |
| Integrations | Real ZarinPal, AqayePardakht, SpotPlayer, and SMS stay blocked without credentials | Honest limit |
| Progress analytics | Not shown. SpotPlayer is not queried for watch time | Correct omission |
| Upload/media library | Ticket attachments only. Course art is a local path, not an upload pipeline | P2 |
| Tests | Unit tests cover commerce/auth helpers. No browser E2E | P2 |

## Security notes (not a claim of perfection)

Controls in place: argon2id passwords, hashed sessions, OTP attempt limits, auth rate limit (Redis or per-process memory), owner guard on `/admin`, payment verify on the server, SpotPlayer key not returned to the client, same-origin check on new BFF mutations.

Remaining risks, unchanged by this pass: CSP still allows inline scripts for the Next app router, ticket files are on local disk, notification rate limit is in-memory, and there is no secret-scanning CI. See `docs/security/SECURITY_CONTROLS.md`.

## Verification limits

Mongard’s logged-in classroom, checkout, and video player were not accessible without an account. Nothing about those private screens was inferred beyond the public catalog pattern: course story, syllabus, path, then purchase.

Live payment and SpotPlayer calls were not executed. Adapters still refuse to invent `PAID` or a license key.
