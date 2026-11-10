# Implementation plan

Order used for this pass, then what remains.

## Done in this pass

1. Audit recorded in `docs/PROJECT_AUDIT.md`.
2. Public shell: footer, mobile menu, FAQ (published CMS rows), terms, 404, error, forbidden, maintenance flag.
3. Journal: `Article` model and migration, public `/journal`, owner editor, three seeded notes.
4. Catalog: level filter, sort, clear filters. Homepage shows real categories and paths.
5. Course page: breadcrumbs, free-preview list from lessons, related courses in the same category, Course JSON-LD, plain-language purchase note.
6. Student: account nav and password change that revokes all sessions.
7. Owner: create/edit course, category, and journal; add/delete chapters and lessons; lesson count refreshed from the database.
8. SEO: new public URLs in sitemap and robots. Private routes stay disallowed and `noindex`.

## Still required before calling the product finished

1. Owner editor for learning paths and steps (data model already exists).
2. Inline rename for existing lessons (PATCH is implemented; the form only adds and deletes).
3. Account profile edits (name, phone) and a real email/SMS provider.
4. Media upload for covers instead of pasting an `/artwork/...` path.
5. Browser pass of purchase, free enroll, ticket reply, and admin publish once Postgres is running.
6. Merchant and SpotPlayer credentials before any live payment or license can succeed.
7. A second visual pass on admin tables and charts so they are not one shared card pattern. Tokens are in place; not every legacy screen was recomposed.

## Suggested next sequence

1. Run `pnpm db:migrate` and `pnpm db:seed` against local Postgres so journal rows and editors have data.
2. Sign in as `admin`, create a draft course, add a chapter and a preview lesson, publish it, and confirm `/courses/[slug]`.
3. Sign in as `sara`, change password, confirm the old session is dead, and open `/dashboard/access`.
4. Only then attach real gateway and SpotPlayer credentials. Do not point the UI at mock success in production.
