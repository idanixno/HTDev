import type { Metadata } from "next";
import Link from "next/link";
import { DisinabBadge, DisinabPlate } from "../../components/disinab";
import { fetchPaths } from "../../lib/catalog";
import { buildPageMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "مسیرهای یادگیری",
  description:
    "نقشهٔ راه پیشنهادی دوره‌های ژرفا — ترتیب پیشنهادی بدون اشتراک اجباری.",
  path: "/paths",
});

export default async function PathsPage() {
  const paths = await fetchPaths();

  return (
    <div className="paths disinab-paths">
      <DisinabPlate className="disinab-paths__hero" aria-labelledby="paths-title">
        <nav className="crumbs disinab-paths__crumbs" aria-label="مسیر">
          <Link href="/">خانه</Link>
          <span aria-hidden="true">/</span>
          <span>مسیرها</span>
        </nav>
        <div className="disinab-paths__intro">
          <div>
            <p className="disinab__brand">ژرفا</p>
            <h1 id="paths-title">نقشهٔ راه</h1>
            <p className="disinab__line">
              ترتیب پیشنهادی است. هر دوره جدا فروخته می‌شود و مسیر اشتراک
              نمی‌سازد.
            </p>
          </div>
          <div className="disinab-paths__meta">
            <DisinabBadge tone="accent">مسیر یادگیری</DisinabBadge>
            {paths.length > 0 ? (
              <DisinabBadge tone="muted">
                {paths.length.toLocaleString("fa-IR")} مسیر
              </DisinabBadge>
            ) : null}
          </div>
        </div>
      </DisinabPlate>

      {paths.length === 0 ? (
        <DisinabPlate className="disinab-paths__empty" aura={false}>
          <p className="disinab__line">مسیر منتشرشده‌ای در دسترس نیست.</p>
        </DisinabPlate>
      ) : (
        <ul className="path-index disinab-paths__grid">
          {paths.map((path) => (
            <li key={path.id}>
              <Link href={path.href} className="path-card disinab-paths__card">
                <span className="path-card__media disinab-paths__media">
                  {path.coverAsset ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={path.coverAsset} alt="" />
                  ) : (
                    <span className="disinab-paths__fallback">ژرفا</span>
                  )}
                </span>
                <span className="path-card__body disinab-paths__body">
                  <span className="path-card__count disinab-paths__count">
                    {path.stepCount.toLocaleString("fa-IR")} گام
                  </span>
                  <strong>{path.title}</strong>
                  {path.summary ? (
                    <span className="path-card__summary">{path.summary}</span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
