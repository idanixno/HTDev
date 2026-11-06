/**
 * Canonical public origin for SEO (canonical URLs, OG, sitemap, robots).
 * Prefer NEXT_PUBLIC_SITE_URL; fall back to WEB_ORIGIN; local default last.
 */
export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.WEB_ORIGIN?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteUrl()}${path}`;
}
