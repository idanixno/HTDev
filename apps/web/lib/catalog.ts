import { cache } from "react";
import { apiBaseUrl } from "./auth-constants";
import { DEFAULT_SITE_CHROME, type SiteChrome } from "./site-chrome";

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
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  noIndex?: boolean;
  publishedAt?: string | null;
  updatedAt?: string;
};

export type PublicCourseLesson = {
  id: string;
  title: string;
  summary: string | null;
  sortOrder: number;
  durationMinutes: number | null;
  isPreview: boolean;
  previewAsset: string | null;
  videoAsset: string | null;
};

export type PublicCourseModule = {
  id: string;
  title: string;
  summary: string | null;
  sortOrder: number;
  lessons: PublicCourseLesson[];
};

export type PublicCoursePurchaseNote = {
  id: string;
  body: string;
  sortOrder: number;
  scope: "global" | "course";
};

export type PublicCourseDetail = PublicCourseCard & {
  description: string | null;
  previewAsset: string | null;
  spotPlayerProtected: boolean;
  publishedAt: string | null;
  modules: PublicCourseModule[];
  purchaseNotes?: PublicCoursePurchaseNote[];
};

export type PublicCategory = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  sortOrder: number;
  courseCount: number;
};

export type PublicPathStep = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  sortOrder: number;
  href: string;
  noIndex: boolean;
  course: PublicCourseCard | null;
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
  steps?: PublicPathStep[];
};

/** Path timeline anchored on a course (تخصص / نقشه راه مدرک). */
export type PublicCourseTrack = PublicPath & {
  credentialLabel: string;
  currentCourseSlug: string;
  currentStepIndex: number | null;
  steps: PublicPathStep[];
};

export type PublicPathStepPage = {
  path: {
    title: string;
    slug: string;
    href: string;
    coverAsset: string | null;
  };
  step: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    sortOrder: number;
    href: string;
    body: string;
    seoTitle: string | null;
    seoDescription: string | null;
    ogImage: string | null;
    noIndex: boolean;
    course: PublicCourseCard | null;
  };
  previous: { title: string; href: string } | null;
  next: { title: string; href: string } | null;
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
export const CATALOG_REVALIDATE_SECONDS = 300;

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
  noIndex?: boolean;
};

export type PublicArticle = PublicArticleCard & {
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  noIndex: boolean;
  updatedAt?: string | null;
};

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

export type PathsPageCms = {
  title: string;
  lead: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export async function fetchPathsPageCms(): Promise<PathsPageCms> {
  return (
    (await catalogFetch<PathsPageCms>("/catalog/meta/paths-page")) ?? {
      title: "نقشهٔ راه یادگیری",
      lead:
        "مسیرهای پیشنهادی برای یادگیری عمیق. دوره‌ها را به ترتیب ببینید،",
      seoTitle: "نقشهٔ راه",
      seoDescription:
        "ترتیب پیشنهادی دوره‌های DXCode — هر مسیر را به ترتیب بخوانید؛ هر دوره جدا فروخته می‌شود.",
    }
  );
}

export type HomeAnnouncement =
  | { enabled: false }
  | {
      enabled: true;
      text: string;
      href: string | null;
      ctaLabel: string | null;
    };

export async function fetchHomeAnnouncement(): Promise<HomeAnnouncement> {
  try {
    const res = await fetch(
      `${apiBaseUrl()}/catalog/meta/home-announcement`,
      { next: { revalidate: 30 } },
    );
    if (!res.ok) return { enabled: false };
    const data = (await res.json()) as HomeAnnouncement;
    return data?.enabled ? data : { enabled: false };
  } catch {
    return { enabled: false };
  }
}

export async function fetchPathStep(
  pathSlug: string,
  stepSlug: string,
): Promise<PublicPathStepPage | null> {
  return catalogFetch<PublicPathStepPage>(
    `/catalog/paths/${encodeURIComponent(pathSlug)}/steps/${encodeURIComponent(stepSlug)}`,
  );
}

export async function fetchPath(slug: string): Promise<PublicPath | null> {
  return catalogFetch<PublicPath>(
    `/catalog/paths/${encodeURIComponent(slug)}`,
  );
}

export async function fetchCourseTracks(
  slug: string,
): Promise<PublicCourseTrack[]> {
  return (
    (await catalogFetch<PublicCourseTrack[]>(
      `/catalog/courses/${encodeURIComponent(slug)}/tracks`,
    )) ?? []
  );
}

export async function fetchLevels(): Promise<string[]> {
  return (await catalogFetch<string[]>("/catalog/meta/levels")) ?? [];
}

export async function fetchFaq(): Promise<PublicFaq[]> {
  return (await catalogFetch<PublicFaq[]>("/catalog/faq")) ?? [];
}

export type PublicFooterTrusts = {
  enamadHtml: string | null;
  paymentGatewayHtml: string | null;
};

export async function fetchFooterTrusts(): Promise<PublicFooterTrusts> {
  const chrome = await fetchSiteChrome();
  return {
    enamadHtml: chrome.enamadHtml,
    paymentGatewayHtml: chrome.paymentGatewayHtml,
  };
}

/**
 * Site chrome is owned by CMS (`CmsFooterContent` via `/catalog/footer-trusts`).
 * The API already merges DB row with DXCode defaults — no client remapping.
 */
export const fetchSiteChrome = cache(async (): Promise<SiteChrome> => {
  const remote = await catalogFetch<SiteChrome>("/catalog/footer-trusts");
  return remote ?? DEFAULT_SITE_CHROME;
});

export async function fetchArticles(): Promise<PublicArticleCard[]> {
  return (await catalogFetch<PublicArticleCard[]>("/catalog/articles")) ?? [];
}

export async function fetchRelatedArticles(
  courseSlug: string,
  limit = 4,
): Promise<PublicArticleCard[]> {
  return (
    (await catalogFetch<PublicArticleCard[]>(
      `/catalog/courses/${encodeURIComponent(courseSlug)}/related-articles?limit=${encodeURIComponent(String(limit))}`,
    )) ?? []
  );
}

export async function fetchArticle(slug: string): Promise<PublicArticle | null> {
  return catalogFetch<PublicArticle>(
    `/catalog/articles/${encodeURIComponent(slug)}`,
  );
}

export function formatCourseDuration(hours: number | null): string | null {
  if (hours == null || hours <= 0) return null;
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (wholeHours > 0 && minutes > 0) {
    return `${wholeHours.toLocaleString("fa-IR")} ساعت و ${minutes.toLocaleString("fa-IR")} دقیقه`;
  }
  if (wholeHours > 0) return `${wholeHours.toLocaleString("fa-IR")} ساعت`;
  return `${minutes.toLocaleString("fa-IR")} دقیقه`;
}

/** Clock-style duration for course cards (e.g. ۱۷:۱۴:۰۲). */
export function formatCourseDurationClock(hours: number | null): string | null {
  if (hours == null || hours <= 0) return null;
  const totalSeconds = Math.round(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const fa = (n: number) =>
    n.toLocaleString("fa-IR", { minimumIntegerDigits: 2, useGrouping: false });
  return `${fa(h)}:${fa(m)}:${fa(s)}`;
}

export function courseCardStatusLabel(course: PublicCourseCard): string {
  if (
    course.availability === "publishedPaid" ||
    course.availability === "publishedFree"
  ) {
    return "تکمیل ضبط";
  }
  return course.statusLabel;
}

export function canAddCourseToCart(course: PublicCourseCard) {
  return (
    course.offerKind !== "FREE" &&
    (course.availability === "publishedPaid" ||
      course.availability === "preorder")
  );
}

export function courseDiscount(course: PublicCourseCard): {
  percent: number;
  compareLabel: string;
  badge: string;
} | null {
  if (course.offerKind === "FREE" || course.offerKind === "COMING_SOON") {
    return null;
  }
  const compare = course.compareAtToman;
  if (compare == null || compare <= course.priceToman) return null;
  const percent = Math.round(((compare - course.priceToman) / compare) * 100);
  if (percent < 1) return null;
  const compareLabel = formatTomanLabel(compare);
  return {
    percent,
    compareLabel,
    badge: `${percent.toLocaleString("fa-IR")}٪ تخفیف`,
  };
}

export type CartCourseItem = {
  id: string;
  slug: string;
  title: string;
  href: string;
  coverAsset: string | null;
  priceToman: number;
  compareAtToman: number | null;
  priceLabel: string;
  compareAtLabel: string | null;
  discountLabel: string | null;
};

export function formatTomanLabel(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "۰ هزارتومن";
  const asNumber = Math.round(n);
  if (asNumber >= 1_000_000) {
    const millions = Number((asNumber / 1_000_000).toFixed(3));
    return `${millions.toLocaleString("fa-IR", {
      maximumFractionDigits: 3,
      minimumFractionDigits: 0,
    })} میلیون تومن`;
  }
  return `${Math.round(asNumber / 1000).toLocaleString("fa-IR")} هزارتومن`;
}

export function parseTomanLabel(label: string | null | undefined): number {
  if (!label) return 0;
  const latin = label
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[٫,]/g, ".");
  if (/میلیون/.test(label)) {
    const match = latin.match(/(\d+(?:\.\d+)?)/);
    if (!match) return 0;
    const value = Number(match[1]);
    if (!Number.isFinite(value)) return 0;
    return Math.round(value * 1_000_000);
  }
  const normalized = latin.replace(/[^\d]/g, "");
  if (!normalized) return 0;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return 0;
  // Display «هزارتومن»/legacy «تومن» are thousands of stored toman; «تومان» is full.
  if (/تومن/.test(label) && !/تومان/.test(label)) {
    return value * 1000;
  }
  return value;
}

export function cartItemPayable(item: CartCourseItem): number {
  if (typeof item.priceToman === "number" && Number.isFinite(item.priceToman)) {
    return Math.max(0, item.priceToman);
  }
  return parseTomanLabel(item.priceLabel);
}

export function cartItemCompare(item: CartCourseItem): number {
  if (
    typeof item.compareAtToman === "number" &&
    Number.isFinite(item.compareAtToman) &&
    item.compareAtToman > 0
  ) {
    return item.compareAtToman;
  }
  return parseTomanLabel(item.compareAtLabel);
}

export function summarizeCart(items: CartCourseItem[]) {
  let payable = 0;
  let compare = 0;
  for (const item of items) {
    const price = cartItemPayable(item);
    const listed = cartItemCompare(item);
    payable += price;
    compare += listed > price ? listed : price;
  }
  const savings = Math.max(0, compare - payable);
  return {
    count: items.length,
    payable,
    compare,
    savings,
    payableLabel: formatTomanLabel(payable),
    compareLabel: formatTomanLabel(compare),
    savingsLabel: formatTomanLabel(savings),
  };
}

export function toCartItem(course: PublicCourseCard): CartCourseItem {
  const discount = courseDiscount(course);
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    href: course.href,
    coverAsset: course.coverAsset,
    priceToman: course.priceToman,
    compareAtToman: course.compareAtToman,
    priceLabel: course.priceLabel,
    compareAtLabel: discount?.compareLabel ?? null,
    discountLabel: discount?.badge ?? null,
  };
}
