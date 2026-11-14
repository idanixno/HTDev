import { revalidatePath, revalidateTag } from "next/cache";
import { CATALOG_TAG, scopeTag, type CacheScope } from "./cache-tags";

const ADMIN_SCOPE_RULES: Array<{ prefix: string; scopes: CacheScope[] }> = [
  { prefix: "/admin/cms/home", scopes: ["home"] },
  { prefix: "/admin/cms/paths", scopes: ["paths"] },
  { prefix: "/admin/cms/footer", scopes: ["chrome"] },
  { prefix: "/admin/cms/course-notes", scopes: ["courses"] },
  { prefix: "/admin/courses", scopes: ["courses", "topics", "paths", "home"] },
  { prefix: "/admin/modules", scopes: ["courses"] },
  { prefix: "/admin/lessons", scopes: ["courses"] },
  { prefix: "/admin/categories", scopes: ["courses", "home"] },
  { prefix: "/admin/articles", scopes: ["journal", "topics", "courses", "home"] },
  { prefix: "/admin/topics", scopes: ["topics", "courses", "journal"] },
  { prefix: "/admin/topic-relations", scopes: ["topics"] },
  { prefix: "/admin/paths", scopes: ["paths", "courses", "home"] },
  { prefix: "/admin/seo/decision", scopes: ["courses", "journal", "topics", "paths"] },
];

/** Public sections affected by an admin mutation; empty for private-only data (orders, coupons, …). */
export function scopesForAdminPath(apiPath: string): CacheScope[] {
  const p = apiPath.split("?")[0] ?? apiPath;
  const rule = ADMIN_SCOPE_RULES.find(
    (r) => p === r.prefix || p.startsWith(`${r.prefix}/`),
  );
  return rule ? rule.scopes : [];
}

const SCOPE_PAGES: Record<CacheScope, string[]> = {
  courses: ["/courses", "/courses/[slug]"],
  journal: ["/journal", "/journal/[slug]"],
  topics: ["/topics", "/topics/[slug]"],
  paths: ["/paths", "/paths/[slug]", "/paths/[slug]/[step]"],
  home: ["/"],
  chrome: [],
};

const SITEMAP_SCOPES = new Set<CacheScope>(["courses", "journal", "topics", "paths"]);

export function purgeScopes(scopes: CacheScope[]) {
  const unique = [...new Set(scopes)];
  for (const scope of unique) {
    revalidateTag(scopeTag(scope));
    for (const page of SCOPE_PAGES[scope]) revalidatePath(page, "page");
  }
  if (unique.includes("chrome")) revalidatePath("/", "layout");
  if (unique.some((s) => SITEMAP_SCOPES.has(s))) revalidatePath("/sitemap.xml");
  return unique;
}

export function purgeAll() {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}
