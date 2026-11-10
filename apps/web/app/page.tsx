import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { CourseCardLink } from "../components/course-card-link";
import { DisinabBadge, DisinabPlate } from "../components/disinab";
import { fetchArticles, fetchCourses, fetchPaths } from "../lib/catalog";
import { relativePublished } from "../lib/relative-time";
import { buildPageMetadata, siteMetadataBase } from "../lib/seo";
import {
  organizationJsonLd,
  websiteJsonLd,
} from "../lib/structured-data";

export const metadata: Metadata = buildPageMetadata({
  title: siteMetadataBase.title,
  description: siteMetadataBase.description,
  path: "/",
});

export default async function HomePage() {
  const [newest, paths, articles] = await Promise.all([
    fetchCourses({ sort: "newest", pageSize: 6 }),
    fetchPaths(),
    fetchArticles(),
  ]);
  const notes = articles.slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd()),
        }}
      />
      <section className="hero hero--search" aria-labelledby="hero-heading">
        <div className="hero__copy">
          <p className="hero__eyebrow">اطلس یادگیری عمیق</p>
          <h1 id="hero-heading" className="hero__title">
            ژرفا، مسیر عمیقِ یک مدرس
          </h1>
          <p className="hero__lead">
            از مسئلهٔ مشخص تا تصمیم معماری. هر دوره جدا فروخته می‌شود و ویدیوی
            محافظت‌شده در اسپات‌پلیر باز می‌شود.
          </p>
          <form className="hero-search" action="/courses" method="get">
            <label className="visually-hidden" htmlFor="home-search">
              جستجوی دوره
            </label>
            <input
              id="home-search"
              name="q"
              type="search"
              placeholder="چه چیزی را می‌خواهی عمیق یاد بگیری؟"
              autoComplete="off"
              maxLength={100}
              required
            />
            <button type="submit">جستجو</button>
          </form>
        </div>
      </section>

      <section
        className="home-section disinab-home-catalog"
        aria-labelledby="newest-heading"
      >
        <DisinabPlate className="disinab-home-catalog__plate">
          <header className="home-section__head disinab-home-catalog__head">
            <div className="home-section__top disinab-home-catalog__top">
              <div>
                <h2 id="newest-heading">تازه‌ترین دوره‌ها</h2>
                <p className="disinab__line">
                  تازه‌ترین انتشارها برای شروع عمیق؛ هر دوره جدا قابل خرید است.
                </p>
              </div>
              <div className="disinab-home-catalog__actions">
                <DisinabBadge tone="accent">دوره‌ها</DisinabBadge>
                <Link
                  className="home-section__more disinab-home-catalog__more"
                  href="/courses?sort=newest"
                >
                  همه دوره‌ها
                </Link>
              </div>
            </div>
          </header>
          {newest.items.length === 0 ? (
            <p className="empty-note">دورهٔ منتشرشده‌ای در دسترس نیست.</p>
          ) : (
            <ul className="home-grid disinab-home-catalog__grid">
              {newest.items.map((course, index) => (
                <li
                  key={course.id}
                  style={{ "--home-i": index } as CSSProperties}
                >
                  <CourseCardLink course={course} />
                </li>
              ))}
            </ul>
          )}
        </DisinabPlate>
      </section>

      <section className="home-section home-section--quiet" aria-labelledby="paths-heading">
        <div className="home-paths">
          <header className="home-section__head">
            <p className="home-section__eyebrow">مسیرها</p>
            <div className="home-section__top">
              <h2 id="paths-heading">نقشهٔ راه</h2>
              <Link className="home-section__more" href="/paths">
                همه مسیرها
              </Link>
            </div>
            <p className="home-section__lede">
              ترتیب پیشنهادی است، نه اشتراک و نه خرید اجباری بقیهٔ مسیر.
            </p>
          </header>
          {paths.length === 0 ? (
            <p className="empty-note">مسیر منتشرشده‌ای در دسترس نیست.</p>
          ) : (
            <ul className="home-path-rail">
              {paths.slice(0, 3).map((path, index) => (
                <li
                  key={path.id}
                  style={{ "--home-i": index } as CSSProperties}
                >
                  <Link className="home-path-rail__card" href={path.href}>
                    <span className="home-path-rail__index" aria-hidden="true">
                      {(index + 1).toLocaleString("fa-IR", {
                        minimumIntegerDigits: 2,
                      })}
                    </span>
                    <span className="home-path-rail__body">
                      <strong>{path.title}</strong>
                      {path.summary ? (
                        <span className="home-path-rail__summary">
                          {path.summary}
                        </span>
                      ) : null}
                    </span>
                    <span className="home-path-rail__foot">
                      <em>
                        {path.stepCount.toLocaleString("fa-IR")} گام
                      </em>
                      <span className="home-path-rail__go" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path
                            d="M15 5 8 12l7 7"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section
        className="home-section home-section--notes disinab-home-notes"
        aria-labelledby="notes-heading"
      >
        <DisinabPlate className="disinab-home-notes__plate">
          <header className="home-section__head disinab-home-notes__head">
            <div className="home-section__top disinab-home-notes__top">
              <div>
                <h2 id="notes-heading">مقالات</h2>
                <p className="disinab__line">
                  یادداشت‌های کوتاه برای تصمیم‌های مهندسی، پرداخت و دسترسی.
                </p>
              </div>
              <div className="disinab-home-notes__actions">
                <DisinabBadge tone="accent">ژورنال</DisinabBadge>
                <Link
                  className="home-section__more disinab-home-notes__more"
                  href="/journal"
                >
                  همه مقالات
                </Link>
              </div>
            </div>
          </header>
          {notes.length === 0 ? (
            <p className="empty-note">مقاله منتشرشده‌ای در دسترس نیست.</p>
          ) : (
            <ul className="note-grid disinab-home-notes__grid">
              {notes.map((article, index) => {
                const when = relativePublished(article.publishedAt);
                return (
                  <li
                    key={article.id}
                    style={{ "--home-i": index } as CSSProperties}
                  >
                    <article className="note-card disinab-home-notes__card">
                      <Link href={article.href} className="note-card__media">
                        {article.coverAsset ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={article.coverAsset} alt="" />
                        ) : (
                          <span>ژرفا</span>
                        )}
                      </Link>
                      <div className="note-card__body">
                        <p className="note-card__meta">
                          {when ? <span>{when}</span> : null}
                          <span>
                            {article.readingMinutes.toLocaleString("fa-IR")}{" "}
                            دقیقه مطالعه
                          </span>
                        </p>
                        <h3>
                          <Link href={article.href}>{article.title}</Link>
                        </h3>
                        {article.summary ? (
                          <p className="note-card__summary">{article.summary}</p>
                        ) : null}
                        <Link
                          className="note-card__read disinab-home-notes__read"
                          href={article.href}
                        >
                          خواندن مقاله
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </DisinabPlate>
      </section>
    </>
  );
}
