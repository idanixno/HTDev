import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "../../../../components/article-body";
import { fetchArticle, fetchArticles } from "../../../../lib/catalog";
import { parseArticleMarkdown } from "../../../../lib/article-markdown";
import { relativePublished } from "../../../../lib/relative-time";
import { buildPageMetadata } from "../../../../lib/seo";
import { absoluteUrl } from "../../../../lib/site-url";
import { articlePageGraph } from "../../../../lib/structured-data";

type Params = Promise<{ slug: string }>;

function inlineText(
  items: Array<{ type: string; text?: string }>,
): string {
  return items
    .map((item) => ("text" in item && item.text ? item.text : ""))
    .join("")
    .trim();
}

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
    kind: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt ?? article.publishedAt,
    authors: ["آرمان راد"],
  });
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) notFound();
  const others = (await fetchArticles())
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);

  const blocks = parseArticleMarkdown(article.body);
  const toc = blocks
    .filter((block) => block.type === "h2")
    .map((block) => {
      if (block.type !== "h2") return null;
      return { id: block.id, label: inlineText(block.inlines) };
    })
    .filter((item): item is { id: string; label: string } =>
      Boolean(item && item.label),
    );

  const description =
    article.seoDescription || article.summary || article.title;
  const shareImage = article.ogImage || article.coverAsset;
  const wordCount = article.body
    .replace(/[#>*`_\-[\]()]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  const jsonLd = articlePageGraph({
    headline: article.title,
    description,
    path: article.href,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    image: shareImage,
    readingMinutes: article.readingMinutes,
    wordCount,
  });

  const publishedLabel = article.publishedAt
    ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(
        new Date(article.publishedAt),
      )
    : null;

  return (
    <article
      className="reading"
      itemScope
      itemType="https://schema.org/BlogPosting"
      lang="fa"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="reading__mast">
        <nav className="crumbs" aria-label="مسیر صفحه">
          <ol className="crumbs__list">
            <li>
              <Link href="/">خانه</Link>
            </li>
            <li>
              <Link href="/journal">مقالات</Link>
            </li>
            <li aria-current="page">
              <span>{article.title}</span>
            </li>
          </ol>
        </nav>

        <h1 itemProp="headline">{article.title}</h1>
        {article.summary ? (
          <p className="reading__lead" itemProp="description">
            {article.summary}
          </p>
        ) : null}

        <ul className="reading__byline" aria-label="اطلاعات انتشار">
          <li>
            <span>
              {article.readingMinutes.toLocaleString("fa-IR")} دقیقه مطالعه
            </span>
            <meta
              itemProp="timeRequired"
              content={`PT${Math.round(article.readingMinutes)}M`}
            />
          </li>
          {article.publishedAt ? (
            <li>
              <time
                dateTime={article.publishedAt}
                itemProp="datePublished"
              >
                {publishedLabel}
              </time>
            </li>
          ) : null}
          {article.updatedAt ? (
            <meta itemProp="dateModified" content={article.updatedAt} />
          ) : null}
          <li
            itemProp="author"
            itemScope
            itemType="https://schema.org/Person"
          >
            <span itemProp="name">آرمان راد</span>
          </li>
        </ul>
      </header>

      {article.coverAsset ? (
        <figure className="reading__cover" itemProp="image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverAsset}
            alt={`تصویر شاخص مقاله «${article.title}»`}
            decoding="async"
            fetchPriority="high"
          />
          <figcaption className="visually-hidden">
            تصویر شاخص مقاله {article.title}
          </figcaption>
        </figure>
      ) : null}

      {toc.length > 1 ? (
        <nav className="reading__toc" aria-labelledby="article-toc-title">
          <h2 id="article-toc-title">فهرست مطالب</h2>
          <ol>
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <section
        className="reading__sheet"
        itemProp="articleBody"
        aria-label="متن مقاله"
      >
        <ArticleBody body={article.body} />
        <footer className="reading__close">
          <p>پایان این مقاله</p>
          <Link href="/journal" rel="index">
            همهٔ مقالات
          </Link>
        </footer>
      </section>

      <meta itemProp="inLanguage" content="fa-IR" />
      <meta itemProp="isAccessibleForFree" content="true" />
      <link itemProp="mainEntityOfPage" href={absoluteUrl(article.href)} />

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
                      <img
                        src={item.coverAsset}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span
                        className="reading__thumb dx-wordmark dx-wordmark--inline"
                        aria-hidden="true"
                      >
                        DXCode
                      </span>
                    )}
                    <span className="reading__next-copy">
                      <span>{item.title}</span>
                      <small>
                        {when ? <span>{when}</span> : null}
                        <span>
                          {item.readingMinutes.toLocaleString("fa-IR")} دقیقه
                        </span>
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
