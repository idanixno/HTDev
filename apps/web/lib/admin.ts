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
  q?: string;
}) {
  const qs = new URLSearchParams();
  if (query?.status) qs.set("status", query.status);
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
    }>
  >(`/admin/orders${suffix}`);
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

export async function fetchAdminCoupons() {
  return adminFetch<
    Array<{
      id: string;
      code: string;
      discountType: string;
      percentOff: number | null;
      amountOffToman: number | null;
      redemptionCount: number;
      maxRedemptions: number | null;
      active: boolean;
    }>
  >("/admin/coupons");
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
    updatedAt: string | null;
  }>("/admin/cms/home");
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
  if (!n) return "۰ تومان";
  return `${n.toLocaleString("fa-IR")} تومان`;
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
