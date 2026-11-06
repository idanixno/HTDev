import Link from "next/link";
import { fetchPaths } from "../../lib/catalog";

export default async function PathsPage() {
  const paths = await fetchPaths();

  return (
    <div className="paths">
      <header className="paths__intro">
        <p className="paths__eyebrow">۰۴ / مسیرهای یادگیری</p>
        <h1 className="paths__title">نقشهٔ راه پیشنهادی</h1>
        <p className="paths__lead">
          ترتیب پیشنهادی دوره‌ها — نه اشتراک اجباری. هر مسیر به جزئیات و دوره‌های
          واقعی کاتالوگ وصل است.
        </p>
      </header>

      {paths.length === 0 ? (
        <p className="paths__empty">هنوز مسیر منتشرشده‌ای در دسترس نیست.</p>
      ) : (
        <ul className="paths__list">
          {paths.map((path) => (
            <li key={path.id} className="paths__item">
              <div
                className="paths__art"
                style={
                  path.coverAsset
                    ? { backgroundImage: `url(${path.coverAsset})` }
                    : undefined
                }
                aria-hidden="true"
              />
              <div className="paths__body">
                <h2>
                  <Link href={path.href}>{path.title}</Link>
                </h2>
                <p>{path.summary}</p>
                <p className="paths__meta">
                  {path.stepCount.toLocaleString("fa-IR")} گام
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
