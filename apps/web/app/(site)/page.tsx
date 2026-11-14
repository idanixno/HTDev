import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArticleCard } from "../../components/article-card";
import { CourseCardLink } from "../../components/course-card-link";
import { DisinabPlate } from "../../components/disinab";
import { DxCodeLogo } from "../../components/dxcode-logo";
import { HomeAnnouncementBanner } from "../../components/home-announcement";
import {
  fetchArticles,
  fetchCourses,
  fetchHomeAnnouncement,
  fetchPaths,
} from "../../lib/catalog";
import { buildPageMetadata, siteMetadataBase } from "../../lib/seo";
import { ownedCourseSlugs } from "../../lib/enrollment";
import { fetchCurrentUser } from "../../lib/session";
import {
  organizationJsonLd,
  websiteJsonLd,
} from "../../lib/structured-data";

export const metadata: Metadata = buildPageMetadata({
  title: siteMetadataBase.title,
  description: siteMetadataBase.description,
  path: "/",
});

/** Always render from live catalog — avoid baking empty home when API was down. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [newest, paths, articles, announcement, user] = await Promise.all([
    fetchCourses({ sort: "newest", pageSize: 6 }),
    fetchPaths(),
    fetchArticles(),
    fetchHomeAnnouncement(),
    fetchCurrentUser(),
  ]);
  const owned = user ? await ownedCourseSlugs() : new Set<string>();
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
      <HomeAnnouncementBanner announcement={announcement} />
      <section className="dx-hero" aria-labelledby="hero-heading">
        <div className="dx-hero__aura" aria-hidden="true" />
        <div className="dx-hero__grid">
          <div className="dx-hero__copy">
            <p className="dx-hero__kicker">LEARN · BUILD · GROW</p>
            <h1 id="hero-heading" className="dx-hero__title">
              از یادگیری کد تا{" "}
              <span className="dx-hero__accent">درک مهندسی</span>
            </h1>
            <p className="dx-hero__lead">
              دانش فناوری را عمیق یاد بگیر، واقعی بساز و حرفه‌ای رشد کن.
            </p>
            <form className="dx-hero__search" action="/courses" method="get">
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
          <div className="dx-hero__visual" aria-hidden="true">
            <div className="dx-interlock">
              <span className="dx-interlock__ribbon dx-interlock__ribbon--a" />
              <span className="dx-interlock__ribbon dx-interlock__ribbon--b" />
              <span className="dx-interlock__core">
                <DxCodeLogo className="dx-interlock__mark" decorative bare />
              </span>
            </div>
          </div>
        </div>
        <ul className="dx-hero__facts">
          <li>
            <strong>دورهٔ تخصصی</strong>
            <span>محتوای عمیق و پروژه‌محور</span>
          </li>
          <li>
            <strong>مسیر روشن</strong>
            <span>ترتیب پیشنهادی بدون اجبار</span>
          </li>
          <li>
            <strong>مهارت واقعی</strong>
            <span>از مسئله تا تصمیم مهندسی</span>
          </li>
        </ul>
      </section>

      {newest.items.length > 0 ? (
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
                    تازه‌ترین انتشارها برای شروع عمیق.
                  </p>
                </div>
                <div className="disinab-home-catalog__actions">
                  <Link
                    className="home-section__more disinab-home-catalog__more"
                    href="/courses?sort=newest"
                  >
                    همه دوره‌ها
                  </Link>
                </div>
              </div>
            </header>
            <ul className="home-grid disinab-home-catalog__grid">
              {newest.items.map((course, index) => (
                <li
                  key={course.id}
                  style={{ "--home-i": index } as CSSProperties}
                >
                  <CourseCardLink
                    course={course}
                    enrolled={owned.has(course.slug)}
                  />
                </li>
              ))}
            </ul>
          </DisinabPlate>
        </section>
      ) : null}

      {paths.length > 0 ? (
        <section
          className="home-section disinab-home-paths"
          aria-labelledby="paths-heading"
        >
          <DisinabPlate className="disinab-home-paths__plate">
            <header className="home-section__head disinab-home-paths__head">
              <div className="home-section__top disinab-home-paths__top">
                <div>
                  <h2 id="paths-heading">نقشهٔ راه</h2>
                  <p className="disinab__line">
                    ترتیب پیشنهادی است، نه اشتراک و نه خرید اجباری بقیهٔ مسیر.
                  </p>
                </div>
                <div className="disinab-home-paths__actions">
                  <Link
                    className="home-section__more disinab-home-paths__more"
                    href="/paths"
                  >
                    همه مسیرها
                  </Link>
                </div>
              </div>
            </header>
            <ul className="home-path-rail disinab-home-paths__rail">
              {paths.slice(0, 3).map((path, index) => (
                <li
                  key={path.id}
                  style={{ "--home-i": index } as CSSProperties}
                >
                  <Link
                    className="home-path-rail__card disinab-home-paths__card"
                    href={path.href}
                  >
                    <span className="home-path-rail__top">
                      <span className="home-path-rail__index" aria-hidden="true">
                        {(index + 1).toLocaleString("fa-IR", {
                          minimumIntegerDigits: 2,
                        })}
                      </span>
                      <span className="home-path-rail__chip">مسیر</span>
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
                      {path.stepCount > 0 ? (
                        <em>
                          {path.stepCount.toLocaleString("fa-IR")} گام
                        </em>
                      ) : null}
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
          </DisinabPlate>
        </section>
      ) : null}

      {notes.length > 0 ? (
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
                  <Link
                    className="home-section__more disinab-home-notes__more"
                    href="/journal"
                  >
                    همه مقالات
                  </Link>
                </div>
              </div>
            </header>
            <ul className="note-grid disinab-home-notes__grid">
              {notes.map((article, index) => (
                <li key={article.id}>
                  <ArticleCard article={article} index={index} />
                </li>
              ))}
            </ul>
          </DisinabPlate>
        </section>
      ) : null}
    </>
  );
}
