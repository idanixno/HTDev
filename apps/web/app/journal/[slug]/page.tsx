import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "../../../components/article-body";
import { fetchArticle, fetchArticles } from "../../../lib/catalog";
import { relativePublished } from "../../../lib/relative-time";
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
      title: "مقاله یافت نشد",
      description: "این مقاله منتشر نشده است.",
      path: `/journal/${slug}`,
      noIndex: true,
    });
  }
  return buildPageMetadata({
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.summary || article.title,
    path: article.href,
    imagePath: article.ogImage || article.coverAsset,
    noIndex: article.noIndex,
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
    description: article.seoDescription || article.summary || article.title,
    inLanguage: "fa",
    datePublished: article.publishedAt ?? undefined,
    mainEntityOfPage: absoluteUrl(article.href),
    image: (() => {
      const share = article.ogImage || article.coverAsset;
      if (!share) return undefined;
      return share.startsWith("http") ? share : absoluteUrl(share);
    })(),
    author: { "@type": "Person", name: "آرمان راد" },
  };

  const publishedLabel = article.publishedAt
    ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(
        new Date(article.publishedAt),
      )
    : null;

  return (
    <article className="reading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="reading__mast">
        <nav className="crumbs" aria-label="مسیر">
          <Link href="/">خانه</Link>
          <span aria-hidden="true">/</span>
          <Link href="/journal">مقالات</Link>
        </nav>
        <h1>{article.title}</h1>
        {article.summary ? <p className="reading__lead">{article.summary}</p> : null}
        <p className="reading__byline">
          <span>{article.readingMinutes.toLocaleString("fa-IR")} دقیقه مطالعه</span>
          {publishedLabel ? <span>{publishedLabel}</span> : null}
          <span>آرمان راد</span>
        </p>
      </header>

      {article.coverAsset ? (
        <figure className="reading__cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.coverAsset} alt="" />
        </figure>
      ) : null}

      <div className="reading__sheet">
        <ArticleBody body={article.body} />
        <footer className="reading__close">
          <p>پایان این مقاله</p>
          <Link href="/journal">همهٔ مقالات</Link>
        </footer>
      </div>

      {others.length > 0 ? (
        <aside className="reading__more" aria-labelledby="more-notes">
          <h2 id="more-notes">ادامهٔ خواندن</h2>
          <ul className="reading__next">
            {others.map((item) => {
              const when = relativePublished(item.publishedAt);
              return (
              <li key={item.id}>
                <Link href={item.href}>
                  {item.coverAsset ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.coverAsset} alt="" />
                  ) : (
                    <span className="reading__thumb" aria-hidden="true">
                      ژرفا
                    </span>
                  )}
                  <span className="reading__next-copy">
                    <span>{item.title}</span>
                    <small>
                      {when ? <span>{when}</span> : null}
                      <span>{item.readingMinutes.toLocaleString("fa-IR")} دقیقه</span>
                    </small>
                  </span>
                </Link>
              </li>
              );
            })}
          </ul>
        </aside>
      ) : null}
    </article>
  );
}
