import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { DisinabBadge, DisinabPlate } from "../../../components/disinab";
import { fetchArticles } from "../../../lib/catalog";
import { buildPageMetadata } from "../../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "مقالات",
  description: "مقالات آموزشی ژرفا درباره انتخاب دوره، خرید و دسترسی.",
  path: "/journal",
});

type Search = Promise<{ q?: string }>;

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const articles = await fetchArticles();
  const visible = query
    ? articles.filter((article) => {
        const haystack = `${article.title} ${article.summary ?? ""}`.toLocaleLowerCase(
          "fa",
        );
        return haystack.includes(query.toLocaleLowerCase("fa"));
      })
    : articles;

  return (
    <div className="journal disinab-journal">
      <DisinabPlate
        className="disinab-journal__mast"
        aria-labelledby="journal-title"
      >
        <nav className="crumbs disinab-journal__crumbs" aria-label="مسیر">
          <Link href="/">خانه</Link>
          <span aria-hidden="true">/</span>
          <span>مقالات</span>
        </nav>
        <div className="disinab-journal__intro">
          <div className="disinab-journal__intro-copy">
            <div className="disinab-journal__title-row">
              <h1 id="journal-title">مقالات ژرفا</h1>
              <form
                className="catalog-search disinab-journal__search"
                action="/journal"
                method="get"
                role="search"
              >
                <label className="visually-hidden" htmlFor="journal-search">
                  جستجوی مقاله
                </label>
                <input
                  id="journal-search"
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder="جستجو در عنوان مقاله"
                  autoComplete="off"
                  maxLength={100}
                />
                <button type="submit">جستجو</button>
              </form>
            </div>
            <p className="disinab__line">
              نوشته‌های کوتاه، قبل از باز کردن دوره.
            </p>
          </div>
          <DisinabBadge tone="accent">
            {visible.length.toLocaleString("fa-IR")} مقاله
          </DisinabBadge>
        </div>
      </DisinabPlate>

      <DisinabPlate
        className="disinab-journal__feed"
        aura={false}
        as="section"
        aria-live="polite"
      >
        {visible.length === 0 ? (
          <p className="disinab__line disinab-journal__empty">
            {query
              ? "مقاله‌ای با این عبارت پیدا نشد."
              : "مقاله منتشرشده‌ای در دسترس نیست."}
          </p>
        ) : (
          <ul className="note-grid disinab-journal__grid">
            {visible.map((article, index) => (
              <li
                key={article.id}
                style={{ "--note-i": index } as CSSProperties}
              >
                <article className="note-card disinab-journal__card">
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
                      <span>
                        {article.readingMinutes.toLocaleString("fa-IR")} دقیقه
                        مطالعه
                      </span>
                    </p>
                    <h2>
                      <Link href={article.href}>{article.title}</Link>
                    </h2>
                    {article.summary ? (
                      <p className="note-card__summary">{article.summary}</p>
                    ) : null}
                    <Link
                      className="note-card__read disinab-journal__read"
                      href={article.href}
                    >
                      خواندن مقاله
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </DisinabPlate>
    </div>
  );
}
