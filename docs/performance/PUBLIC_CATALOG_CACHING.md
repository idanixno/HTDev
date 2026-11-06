# Public catalog caching notes

## What is cached

Next.js server components fetch the Nest catalog API through `apps/web/lib/catalog.ts` with:

```ts
next: { revalidate: CATALOG_REVALIDATE_SECONDS } // currently 60
```

Affected routes: home featured courses, `/courses`, `/courses/[slug]`, `/paths`, `/paths/[slug]`, and `sitemap.xml` generation.

## What must not be cached

- Session / identity (`fetchCurrentUser` uses `cache: "no-store"`).
- Checkout options, orders, tickets, notifications, admin analytics — all private; keep `no-store` or default dynamic.

## API side

Nest catalog handlers are plain DB reads with no HTTP cache headers yet. ISR on the web BFF is the primary public cache. For multi-instance production, consider:

- CDN cache on `GET /catalog/*` with short TTL + purge on publish
- Or Next `revalidateTag('catalog')` wired to admin publish actions (not implemented)

## Images & fonts

- Persian primary font (Vazirmatn) uses `next/font` with `display: "swap"` and `preload: true`.
- Secondary Inter / JetBrains Mono: `display: "swap"`, `preload: false` to keep LCP focused on Persian text.
- Course/path cover SVGs under `/public/artwork` load via native `<img>` (`decoding="async"`; course detail uses `fetchPriority="high"` for LCP).

## Admin analytics

Dashboard aggregates use parallel Prisma queries + `groupBy` for status breakdowns (no per-entity N+1). Day series still load paid-order and new-user rows **within the selected date range** only.
