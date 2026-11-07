import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "../../../components/article-body";
import { fetchArticle, fetchArticles } from "../../../lib/catalog";
import { buildPageMetadata } from "../../../lib/seo";
import { absoluteUrl } from "../../../lib/site-url";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) {
    return buildPageMetadata({
      title: "یادداشت یافت نشد",
      description: "این یادداشت منتشر نشده است.",
      path: `/journal/${slug}`,
      noIndex: true,
    });
  }
  return buildPageMetadata({
    title: article.title,
    description: article.summary ?? article.title,
    path: article.href,
    imagePath: article.coverAsset,
  });
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) notFound();
  const others = (await fetchArticles())
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary ?? article.title,
    inLanguage: "fa",
    datePublished: article.publishedAt ?? undefined,
    mainEntityOfPage: absoluteUrl(article.href),
    author: { "@type": "Organization", name: "ژرفا" },
  };

  return (
    <article className="editorial">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="crumbs" aria-label="مسیر">
        <Link href="/">خانه</Link>
        <span aria-hidden="true">/</span>
        <Link href="/journal">یادداشت‌ها</Link>
        <span aria-hidden="true">/</span>
        <span>{article.title}</span>
      </nav>
      <p className="editorial__eyebrow">
        {article.readingMinutes.toLocaleString("fa-IR")} دقیقه مطالعه
      </p>
      <h1>{article.title}</h1>
      {article.summary ? <p className="editorial__lead">{article.summary}</p> : null}
      <ArticleBody body={article.body} />
      {others.length > 0 ? (
        <aside className="editorial__aside">
          <h2>یادداشت‌های دیگر</h2>
          <ul>
            {others.map((item) => (
              <li key={item.id}>
                <Link href={item.href}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </article>
  );
}
