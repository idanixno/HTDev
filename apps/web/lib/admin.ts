import { apiBaseUrl } from "./auth-constants";
import { getSessionToken } from "./session";

async function adminFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    const res = await fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-session-token": token,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 403) return null;
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type AnalyticsDashboard = {
  range: { from: string; to: string };
  summary: {
    revenueToman: number;
    paidOrders: number;
    newUsers: number;
    publishedCourses: number;
    openTickets: number;
    pendingProvisioning: number;
  };
  series: {
    revenueByDay: { date: string; value: number }[];
    ordersByDay: { date: string; value: number }[];
    usersByDay: { date: string; value: number }[];
  };
  breakdowns: {
    ordersByStatus: { status: string; count: number }[];
    coursesByPublication: { status: string; count: number }[];
    ticketsByStatus: { status: string; count: number }[];
    provisioningByStatus: { status: string; count: number }[];
  };
};

export type AdminListResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export async function fetchAdminAnalytics(range?: {
  from?: string;
  to?: string;
}): Promise<AnalyticsDashboard | null> {
  const qs = new URLSearchParams();
  if (range?.from) qs.set("from", range.from);
  if (range?.to) qs.set("to", range.to);
  const suffix = qs.toString() ? `?${qs}` : "";
  return adminFetch<AnalyticsDashboard>(`/admin/analytics/dashboard${suffix}`);
}

export type AdminNavBadges = Record<string, number>;

export async function fetchAdminNavBadges(): Promise<AdminNavBadges> {
  const data = await adminFetch<{ badges: AdminNavBadges }>("/admin/nav-badges");
  return data?.badges ?? {};
}

export async function fetchAdminCourses(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  return adminFetch<
    AdminListResult<{
      id: string;
      slug: string;
      title: string;
      publicationStatus: string;
      offerKind: string;
      priceLabel: string;
      featured: boolean;
      category: { id: string; title: string; slug: string } | null;
      orderCount: number;
      updatedAt: string;
    }>
  >(`/admin/courses${qs}`);
}

export type AdminCourseDraft = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  categoryId: string | null;
  publicationStatus: string;
  offerKind: string;
  priceToman: number;
  compareAtToman: number | null;
  levelLabel: string | null;
  durationHours: number | null;
  lessonCount: number;
  featured: boolean;
  sortOrder: number;
  coverAsset: string | null;
  previewAsset: string | null;
  indexLabel: string | null;
  diagramKind: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  noIndex: boolean;
  modules: Array<{
    id: string;
    title: string;
    summary: string | null;
    sortOrder: number;
    lessons: Array<{
      id: string;
      title: string;
      summary: string | null;
      sortOrder: number;
      durationMinutes: number | null;
      isPreview: boolean;
      previewAsset: string | null;
      videoAsset: string | null;
      moduleId: string | null;
    }>;
  }>;
};

export async function fetchAdminCourse(id: string) {
  return adminFetch<AdminCourseDraft>(`/admin/courses/${encodeURIComponent(id)}`);
}

export type AdminArticleDraft = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  coverAsset: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  noIndex: boolean;
  published: boolean;
  readingMinutes: number | null;
  sortOrder: number;
};

export async function fetchAdminArticles() {
  return adminFetch<
    Array<{
      id: string;
      slug: string;
      title: string;
      summary: string | null;
      published: boolean;
      publishedAt: string | null;
      sortOrder: number;
      updatedAt: string;
    }>
  >("/admin/articles");
}

export async function fetchAdminArticle(id: string) {
  return adminFetch<AdminArticleDraft>(
    `/admin/articles/${encodeURIComponent(id)}`,
  );
}

export type AdminPathStepSummary = {
  id: string;
  slug: string;
  title: string;
  sortOrder: number;
  noIndex: boolean;
  updatedAt: string;
};

export type AdminPath = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  coverAsset: string | null;
  published: boolean;
  sortOrder: number;
  steps: AdminPathStepSummary[];
};

export async function fetchAdminPaths() {
  return adminFetch<AdminPath[]>("/admin/paths");
}

export async function fetchAdminPath(pathId: string) {
  return adminFetch<AdminPath>(`/admin/paths/${encodeURIComponent(pathId)}`);
}

export async function fetchAdminPathStep(pathId: string, stepId: string) {
  return adminFetch<{
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    body: string;
    seoTitle: string | null;
    seoDescription: string | null;
    ogImage: string | null;
    noIndex: boolean;
    sortOrder: number;
    path: { id: string; title: string; slug: string };
    course: { title: string; slug: string } | null;
  }>(
    `/admin/paths/${encodeURIComponent(pathId)}/steps/${encodeURIComponent(stepId)}`,
  );
}

export async function fetchAdminCategories() {
  return adminFetch<
    Array<{
      id: string;
      slug: string;
      title: string;
      summary: string | null;
      sortOrder: number;
      courseCount: number;
    }>
  >("/admin/categories");
}

export async function fetchAdminOrders(query?: {
  status?: string;
  licenseStatus?: string;
  q?: string;
}) {
  const qs = new URLSearchParams();
  if (query?.status) qs.set("status", query.status);
  if (query?.licenseStatus) qs.set("licenseStatus", query.licenseStatus);
  if (query?.q) qs.set("q", query.q);
  const suffix = qs.toString() ? `?${qs}` : "";
  return adminFetch<
    AdminListResult<{
      id: string;
      status: string;
      paymentProvider: string | null;
      amountLabel: string;
      couponCode: string | null;
      paidAt: string | null;
      createdAt: string;
      user: {
        id: string;
        username: string;
        displayName: string;
        email: string;
      };
      course: { id: string; slug: string; title: string };
      license: {
        id: string;
        status: string;
        lastError: string | null;
      } | null;
    }>
  >(`/admin/orders${suffix}`);
}

export type AdminOrderDetail = {
  id: string;
  status: string;
  paymentProvider: string | null;
  amountToman: number;
  amountLabel: string;
  couponCode: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  allowedNextStatuses: string[];
  user: {
    id: string;
    username: string;
    displayName: string;
    email: string;
    phone: string | null;
  };
  course: {
    id: string;
    slug: string;
    title: string;
    offerKind: string;
  };
  licenses: Array<{
    id: string;
    status: string;
    lastError: string | null;
    attemptCount: number;
    lastAttemptAt: string | null;
    provisionedAt: string | null;
    licenseKey: string | null;
    licenseUrl: string | null;
    spotPlayerLicenseId: string | null;
    accessSource: string;
    createdAt: string;
    updatedAt: string;
  }>;
  payments: Array<{
    id: string;
    provider: string;
    status: string;
    amountLabel: string;
    gatewayRefId: string | null;
    failureReason: string | null;
    createdAt: string;
    verifiedAt: string | null;
  }>;
};

export async function fetchAdminOrder(
  id: string,
): Promise<AdminOrderDetail | null> {
  return adminFetch<AdminOrderDetail>(
    `/admin/orders/${encodeURIComponent(id)}`,
  );
}

export async function fetchAdminCustomers(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  return adminFetch<
    AdminListResult<{
      id: string;
      username: string;
      email: string;
      phone: string | null;
      displayName: string;
      role: string;
      orderCount: number;
      ticketCount: number;
      enrollmentCount: number;
      createdAt: string;
    }>
  >(`/admin/customers${qs}`);
}

export type AdminCoupon = {
  id: string;
  code: string;
  discountType: string;
  percentOff: number | null;
  amountOffToman: number | null;
  minOrderToman: number | null;
  maxDiscountToman: number | null;
  redemptionCount: number;
  maxRedemptions: number | null;
  active: boolean;
};

export async function fetchAdminCoupons() {
  return adminFetch<AdminCoupon[]>("/admin/coupons");
}

export type AdminGateway = {
  provider: string;
  technicalEnabled: boolean;
  checkoutVisible: boolean;
  isDefault: boolean;
  sandboxMode: boolean;
  credentialsStatus: string;
  usableAtCheckout?: boolean;
  integrationStatus?: string;
};

export async function fetchAdminGateways(): Promise<AdminGateway[] | null> {
  const data = await adminFetch<{ gateways: AdminGateway[] }>(
    "/admin/payments/gateways",
  );
  return data?.gateways ?? null;
}

export async function fetchAdminHomeCms() {
  return adminFetch<{
    id: string;
    heroEyebrow: string | null;
    heroTitle: string;
    heroSubtitle: string | null;
    primaryCtaLabel: string | null;
    primaryCtaHref: string | null;
    secondaryCtaLabel: string | null;
    secondaryCtaHref: string | null;
    announcementEnabled: boolean;
    announcementText: string | null;
    announcementHref: string | null;
    announcementCtaLabel: string | null;
    updatedAt: string | null;
  }>("/admin/cms/home");
}

export async function fetchAdminPathsCms() {
  return adminFetch<{
    id: string;
    title: string;
    lead: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    updatedAt: string | null;
  }>("/admin/cms/paths");
}

export async function fetchAdminFooterCms() {
  return adminFetch<{
    id: string;
    brandName: string;
    brandTagline: string;
    brandKicker: string;
    footerBlurb: string;
    headerLinks: Array<{ href: string; label: string; match?: string }>;
    footerGroups: Array<{
      label: string;
      links: Array<{ href: string; label: string }>;
    }>;
    mobileGroups: Array<{
      label: string;
      links: Array<{ href: string; label: string }>;
    }>;
    guestCtaLabel: string;
    guestCtaHref: string;
    authedCtaLabel: string;
    authedCtaHref: string;
    showCart: boolean;
    showThemeToggle: boolean;
    trustsLabel: string;
    mobileMenuTitle: string;
    mobileMenuLine: string;
    enamadHtml: string | null;
    paymentGatewayHtml: string | null;
    updatedAt: string | null;
  }>("/admin/cms/footer");
}

export async function fetchAdminFaq() {
  return adminFetch<
    Array<{
      id: string;
      question: string;
      answer: string;
      sortOrder: number;
      published: boolean;
    }>
  >("/admin/cms/faq");
}

export async function fetchAdminActivity(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  return adminFetch<
    AdminListResult<{
      id: string;
      action: string;
      entityType: string;
      entityId: string | null;
      summary: string;
      createdAt: string;
      actor: {
        id: string;
        username: string;
        displayName: string;
      } | null;
    }>
  >(`/admin/activity${qs}`);
}

export function formatTomanFa(n: number): string {
  if (!n) return "۰ هزارتومن";
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

export function formatDateFa(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
