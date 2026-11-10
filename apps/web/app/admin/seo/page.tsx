import Link from "next/link";
import { cookies } from "next/headers";
import { apiBaseUrl, SESSION_COOKIE_NAME } from "../../../lib/auth-constants";

async function adminGet<T>(path: string): Promise<T | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const res = await fetch(`${apiBaseUrl()}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-session-token": token,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default async function SeoCenterPage() {
  const [overview, audit, ai, security, google] = await Promise.all([
    adminGet<{
      courses: number;
      articles: number;
      coursesMissingMeta: number;
      articlesMissingMeta: number;
      publishedNoIndex: number;
      sitemapPath: string;
      robotsPath: string;
    }>("/admin/seo/overview"),
    adminGet<{
      courses: Array<{
        id: string;
        title: string;
        slug: string;
        href: string;
        score: number;
        critical: number;
      }>;
      articles: Array<{
        id: string;
        title: string;
        slug: string;
        href: string;
        score: number;
        critical: number;
      }>;
    }>("/admin/seo/content-audit"),
    adminGet<{ configured: boolean; provider: string }>("/admin/seo/ai-status"),
    adminGet<{ days: number; counts: Record<string, number> }>(
      "/admin/security/summary",
    ),
    adminGet<{
      code: string;
      message: string;
      credentialsPresent: boolean;
      connected: boolean;
    }>("/admin/seo/google/status"),
  ]);

  const rows = [
    ...(audit?.courses ?? []),
    ...(audit?.articles ?? []),
  ].sort((a, b) => a.score - b.score);

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">سئو</p>
          <h1 className="admin-page__title">مرکز سئو</h1>
          <p className="admin-page__subtitle">
            سلامت فنی، محتوای نیازمند بهینه‌سازی، وضعیت AI و امنیت. دادهٔ گوگل
            فقط پس از اتصال واقعی.
          </p>
        </div>
      </header>

      <div className="admin-kpis">
        <div className="admin-kpis__grid">
          <article className="admin-kpi" data-tone="sale">
            <p className="admin-kpi__label">دوره‌ها بدون متای کامل</p>
            <p className="admin-kpi__value">
              {(overview?.coursesMissingMeta ?? 0).toLocaleString("fa-IR")}
            </p>
          </article>
          <article className="admin-kpi" data-tone="pending">
            <p className="admin-kpi__label">مقالات بدون متای کامل</p>
            <p className="admin-kpi__value">
              {(overview?.articlesMissingMeta ?? 0).toLocaleString("fa-IR")}
            </p>
          </article>
          <article className="admin-kpi" data-tone="warning">
            <p className="admin-kpi__label">منتشر + noIndex</p>
            <p className="admin-kpi__value">
              {(overview?.publishedNoIndex ?? 0).toLocaleString("fa-IR")}
            </p>
          </article>
          <article
            className="admin-kpi"
            data-tone={ai?.configured ? "success" : "pending"}
          >
            <p className="admin-kpi__label">دستیار AI</p>
            <p className="admin-kpi__value">
              {ai?.configured ? "فعال" : "بدون کلید"}
            </p>
          </article>
        </div>
      </div>

      <div className="admin-panel" style={{ marginTop: 20 }}>
        <h2>فنی</h2>
        <ul>
          <li>
            Sitemap:{" "}
            <Link href={overview?.sitemapPath ?? "/sitemap.xml"}>
              {overview?.sitemapPath ?? "/sitemap.xml"}
            </Link>
          </li>
          <li>
            Robots:{" "}
            <Link href={overview?.robotsPath ?? "/robots.txt"}>
              {overview?.robotsPath ?? "/robots.txt"}
            </Link>
          </li>
          <li>
            Google: {google?.message ?? "وضعیت نامشخص"} —{" "}
            <Link href="/admin/seo/google">صفحه اتصال</Link>
          </li>
          <li>
            یکپارچه‌سازی‌ها: <Link href="/admin/integrations">تنظیم کلیدها</Link>
          </li>
        </ul>
      </div>

      <div className="admin-panel" style={{ marginTop: 20 }}>
        <h2>محتوای نیازمند توجه</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>عنوان</th>
                <th>امتیاز</th>
                <th>بحرانی</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 25).map((row) => (
                <tr key={`${row.href}-${row.id}`}>
                  <td>
                    <Link href={row.href} className="admin-table__primary">
                      {row.title}
                    </Link>
                    <div className="admin-table__muted">{row.slug}</div>
                  </td>
                  <td>{row.score.toLocaleString("fa-IR")}</td>
                  <td>{row.critical.toLocaleString("fa-IR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-panel" style={{ marginTop: 20 }}>
        <h2>امنیت (۷ روز)</h2>
        <ul>
          {Object.entries(security?.counts ?? {}).length === 0 ? (
            <li>رویداد مشکوکی ثبت نشده است.</li>
          ) : (
            Object.entries(security?.counts ?? {}).map(([type, count]) => (
              <li key={type}>
                {type}: {count.toLocaleString("fa-IR")}
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
