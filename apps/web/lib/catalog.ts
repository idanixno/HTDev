import { apiBaseUrl } from "./auth-constants";

export type CourseCardAvailability =
  | "publishedPaid"
  | "publishedFree"
  | "preorder"
  | "inProduction"
  | "comingSoon"
  | "unavailable";

export type PublicCourseCard = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: { slug: string; title: string } | null;
  publicationStatus: string;
  offerKind: "FREE" | "PAID" | "PRE_SALE" | "COMING_SOON";
  availability: CourseCardAvailability;
  statusLabel: string;
  priceToman: number;
  compareAtToman: number | null;
  priceLabel: string;
  levelLabel: string | null;
  durationHours: number | null;
  lessonCount: number;
  meta: string | null;
  featured: boolean;
  coverAsset: string | null;
  indexLabel: string | null;
  diagramCode: string | null;
  diagramKind: "boundary" | "chain";
  chainNodes: string[];
  href: string;
};

export type PublicCourseDetail = PublicCourseCard & {
  description: string | null;
  publishedAt: string | null;
  modules: {
    id: string;
    title: string;
    summary: string | null;
    sortOrder: number;
    lessons: {
      id: string;
      title: string;
      summary: string | null;
      sortOrder: number;
      durationMinutes: number | null;
      isPreview: boolean;
    }[];
  }[];
};

export type PublicCategory = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  sortOrder: number;
  courseCount: number;
};

export type PublicPath = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  coverAsset: string | null;
  href: string;
  stepCount: number;
  steps?: {
    id: string;
    title: string;
    summary: string | null;
    sortOrder: number;
    course: PublicCourseCard | null;
  }[];
};

export type CourseListResult = {
  items: PublicCourseCard[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/**
 * Public catalog ISR window (seconds).
 * Catalog is public and relatively stable; 60s balances freshness vs API load.
 * Private surfaces (dashboard/admin/auth) must keep cache: "no-store".
 * See docs/performance/PUBLIC_CATALOG_CACHING.md.
 */
export const CATALOG_REVALIDATE_SECONDS = 60;

async function catalogFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${apiBaseUrl()}${path}`, {
      next: { revalidate: CATALOG_REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchCategories(): Promise<PublicCategory[]> {
  return (await catalogFetch<PublicCategory[]>("/catalog/categories")) ?? [];
}

export async function fetchFeaturedCourses(): Promise<PublicCourseCard[]> {
  return (
    (await catalogFetch<PublicCourseCard[]>("/catalog/courses/featured")) ?? []
  );
}

export type PublicFaq = {
  id: string;
  question: string;
  answer: string;
};

export type PublicArticleCard = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverAsset: string | null;
  publishedAt: string | null;
  readingMinutes: number;
  href: string;
};

export type PublicArticle = PublicArticleCard & { body: string };

export async function fetchCourses(params: {
  q?: string;
  category?: string;
  offer?: string;
  level?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}): Promise<CourseListResult> {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.offer) sp.set("offer", params.offer);
  if (params.level) sp.set("level", params.level);
  if (params.sort && params.sort !== "catalog") sp.set("sort", params.sort);
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  const qs = sp.toString();
  return (
    (await catalogFetch<CourseListResult>(
      `/catalog/courses${qs ? `?${qs}` : ""}`,
    )) ?? { items: [], page: 1, pageSize: 12, total: 0, totalPages: 1 }
  );
}

export async function fetchCourse(
  slug: string,
): Promise<PublicCourseDetail | null> {
  return catalogFetch<PublicCourseDetail>(
    `/catalog/courses/${encodeURIComponent(slug)}`,
  );
}

export async function fetchPaths(): Promise<PublicPath[]> {
  return (await catalogFetch<PublicPath[]>("/catalog/paths")) ?? [];
}

export async function fetchPath(slug: string): Promise<PublicPath | null> {
  return catalogFetch<PublicPath>(
    `/catalog/paths/${encodeURIComponent(slug)}`,
  );
}

export async function fetchLevels(): Promise<string[]> {
  return (await catalogFetch<string[]>("/catalog/meta/levels")) ?? [];
}

export async function fetchFaq(): Promise<PublicFaq[]> {
  return (await catalogFetch<PublicFaq[]>("/catalog/faq")) ?? [];
}

export async function fetchArticles(): Promise<PublicArticleCard[]> {
  return (await catalogFetch<PublicArticleCard[]>("/catalog/articles")) ?? [];
}

export async function fetchArticle(slug: string): Promise<PublicArticle | null> {
  return catalogFetch<PublicArticle>(
    `/catalog/articles/${encodeURIComponent(slug)}`,
  );
}

export function courseCardProps(course: PublicCourseCard) {
  const chain =
    course.chainNodes.length >= 3
      ? ([
          course.chainNodes[0]!,
          course.chainNodes[1]!,
          course.chainNodes[2]!,
        ] as [string, string, string])
      : undefined;

  return {
    availability: course.availability,
    indexLabel: course.indexLabel ?? undefined,
    diagramCode: course.diagramCode ?? undefined,
    diagramKind: course.diagramKind,
    chainNodes: chain,
    statusLabel: course.statusLabel,
    title: course.title,
    summary: course.summary ?? "",
    meta: course.meta ?? undefined,
    priceLabel: course.priceLabel,
    href: course.href,
  };
}
