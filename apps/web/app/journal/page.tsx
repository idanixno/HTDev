import type { Metadata } from "next";
import Link from "next/link";
import { fetchArticles } from "../../lib/catalog";
import { buildPageMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "یادداشت‌ها",
  description: "یادداشت‌های آموزشی ژرفا درباره انتخاب دوره، خرید و دسترسی.",
  path: "/journal",
});

export default async function JournalPage() {
  const articles = await fetchArticles();

  return (
    <div className="editorial editorial--wide">
      <header className="editorial__intro">
        <p className="editorial__eyebrow">یادداشت‌ها</p>
        <h1>قبل از اینکه دوره را باز کنید</h1>
        <p className="editorial__lead">
          نوشته‌های کوتاه درباره نحوه خواندن کاتالوگ، تفاوت پرداخت و دسترسی، و
          محدوده همین مجموعه آموزشی.
        </p>
      </header>
      {articles.length === 0 ? (
        <p>یادداشت منتشرشده‌ای در دسترس نیست.</p>
      ) : (
        <ul className="journal-list">
          {articles.map((article) => (
            <li key={article.id}>
              <article>
                <p className="journal-list__meta">
                  {article.readingMinutes.toLocaleString("fa-IR")} دقیقه مطالعه
                </p>
                <h2>
                  <Link href={article.href}>{article.title}</Link>
                </h2>
                {article.summary ? <p>{article.summary}</p> : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
