import type { Metadata } from "next";
import Link from "next/link";
import { fetchArticles } from "../../lib/catalog";
import { buildPageMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "مقالات",
  description: "مقالات آموزشی ژرفا درباره انتخاب دوره، خرید و دسترسی.",
  path: "/journal",
});

type Search = Promise<{ q?: string }>;

export default async function JournalPage({ searchParams }: { searchParams: Search }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const articles = await fetchArticles();
  const visible = query
    ? articles.filter((article) => {
        const haystack = `${article.title} ${article.summary ?? ""}`.toLocaleLowerCase("fa");
        return haystack.includes(query.toLocaleLowerCase("fa"));
      })
    : articles;

  return (
    <div className="journal">
      <header className="page-band page-band--split">
        <div>
          <nav className="crumbs" aria-label="مسیر">
            <Link href="/">خانه</Link>
            <span aria-hidden="true">/</span>
            <span>مقالات</span>
          </nav>
          <h1>مقالات ژرفا</h1>
          <p>نوشته‌های کوتاه، قبل از باز کردن دوره.</p>
        </div>
        <form className="band-search" action="/journal" method="get">
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
      </header>

      {visible.length === 0 ? (
        <p className="empty-note">
          {query ? "مقاله‌ای با این عبارت پیدا نشد." : "مقاله منتشرشده‌ای در دسترس نیست."}
        </p>
      ) : (
        <ul className="note-grid">
          {visible.map((article) => (
            <li key={article.id}>
              <article className="note-card">
                <Link href={article.href} className="note-card__media">
                  {article.coverAsset ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={article.coverAsset} alt="" />
                  ) : (
                    <span>ژرفا</span>
                  )}
                </Link>
                <div className="note-card__body">
                  <p>{article.readingMinutes.toLocaleString("fa-IR")} دقیقه مطالعه</p>
                  <h2>
                    <Link href={article.href}>{article.title}</Link>
                  </h2>
                  {article.summary ? <p className="note-card__summary">{article.summary}</p> : null}
                  <Link className="note-card__read" href={article.href}>
                    خواندن مقاله
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
