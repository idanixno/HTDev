export type CacheScope =
  | "courses"
  | "journal"
  | "topics"
  | "paths"
  | "home"
  | "chrome";

export const CATALOG_TAG = "catalog";

export function scopeTag(scope: CacheScope) {
  return `catalog:${scope}`;
}

/** Data-cache tags for a public `/catalog/*` fetch, so admin saves can bust them. */
export function tagsForCatalogPath(path: string): string[] {
  const p = path.split("?")[0] ?? path;
  const scopes = new Set<CacheScope>();
  if (
    p.startsWith("/catalog/courses") ||
    p === "/catalog/categories" ||
    p === "/catalog/meta/levels"
  ) {
    scopes.add("courses");
    if (p.endsWith("/related-articles")) scopes.add("journal");
    if (p.endsWith("/tracks")) scopes.add("paths");
    if (p === "/catalog/courses/featured") scopes.add("home");
  } else if (p.startsWith("/catalog/articles")) {
    scopes.add("journal");
  } else if (p.startsWith("/catalog/topics")) {
    scopes.add("topics");
  } else if (p.startsWith("/catalog/paths") || p === "/catalog/meta/paths-page") {
    scopes.add("paths");
  } else if (p === "/catalog/meta/home-announcement") {
    scopes.add("home");
  } else if (p === "/catalog/footer-trusts") {
    scopes.add("chrome");
  }
  return [CATALOG_TAG, ...[...scopes].map(scopeTag)];
}
