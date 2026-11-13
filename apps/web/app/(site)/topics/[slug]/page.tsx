import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "../../../../components/article-body";
import { ArticleCard } from "../../../../components/article-card";
import { CourseCardLink } from "../../../../components/course-card-link";
import {
  DisinabBadge,
  DisinabMark,
  DisinabPlate,
} from "../../../../components/disinab";
import { fetchTopic } from "../../../../lib/catalog";
import { buildPageMetadata } from "../../../../lib/seo";
import { absoluteUrl } from "../../../../lib/site-url";
import { topicPageGraph } from "../../../../lib/structured-data";

type Params = Promise<{ slug: string }>;
type Search = Promise<{ page?: string }>;

function topicCanonicalPath(topic: {
  slug: string;
  canonicalUrl: string | null;
  href: string;
}) {
  const raw = topic.canonicalUrl?.trim();
  if (!raw) return topic.href;
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const u = new URL(raw);
      return `${u.pathname}${u.search}` || topic.href;
    } catch {
      return topic.href;
    }
  }
  return raw.startsWith("/") ? raw : `/${raw}`;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = await fetchTopic(slug);
  if (!topic) {
    return buildPageMetadata({
      title: "موضوع یافت نشد",
      description: "این موضوع منتشر نشده است.",
      path: `/topics/${slug}`,
      noIndex: true,
    });
  }
  const path = topicCanonicalPath(topic);
  // Root layout template is `%s | DXCode` — strip brand suffix from seoTitle.
  const rawTitle = topic.seoTitle || topic.h1 || topic.name;
  const title = rawTitle.replace(/\s*\|\s*DXCode\s*$/i, "").trim() || topic.name;
  return buildPageMetadata({
    title,
    description:
      topic.seoDescription || topic.description || topic.name,
    path,
    noIndex: !topic.indexable,
  });
}

export default async function TopicHubPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const topic = await fetchTopic(slug, { page, pageSize: 12 });
  if (!topic) notFound();

  const description =
    topic.seoDescription || topic.description || topic.name;
  const path = topicCanonicalPath(topic);
  const listItems = [
    ...topic.children.map((c) => ({
      name: c.name,
      url: absoluteUrl(c.href),
    })),
    ...topic.courses.items.map((c) => ({
      name: c.title,
      url: absoluteUrl(c.href),
    })),
    ...topic.articles.items.map((a) => ({
      name: a.title,
      url: absoluteUrl(a.href),
    })),
  ];

  const jsonLd = topicPageGraph({
    name: topic.h1 || topic.name,
    description,
    path,
    breadcrumbs: [
      { name: "خانه", path: "/" },
      { name: "موضوعات", path: "/topics" },
      ...topic.breadcrumbs.map((b) => ({ name: b.name, path: b.href })),
    ],
    items: listItems,
  });

  return (
    <div className="topic-hub disinab-topic">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DisinabPlate className="disinab-topic__mast" aria-labelledby="topic-heading">
        <nav className="crumbs disinab-topic__crumbs" aria-label="مسیر">
          <Link href="/">خانه</Link>
          <span aria-hidden="true">/</span>
          <Link href="/topics">موضوعات</Link>
          {topic.breadcrumbs.map((crumb, index) => (
            <span key={crumb.slug} className="disinab-topic__crumb-seg">
              <span aria-hidden="true">/</span>
              {index === topic.breadcrumbs.length - 1 ? (
                <span>{crumb.name}</span>
              ) : (
                <Link href={crumb.href}>{crumb.name}</Link>
              )}
            </span>
          ))}
        </nav>

        <div className="disinab-topic__intro">
          <DisinabMark>DX</DisinabMark>
          <p className="disinab__brand">موضوع</p>
          <div className="disinab-topic__title-row">
            <h1 id="topic-heading">{topic.h1 || topic.name}</h1>
            {!topic.indexable ? (
              <DisinabBadge tone="muted">noindex</DisinabBadge>
            ) : (
              <DisinabBadge tone="live">هاب</DisinabBadge>
            )}
          </div>
          {topic.description ? (
            <p className="disinab__line">{topic.description}</p>
          ) : null}
        </div>
      </DisinabPlate>

      {topic.introContent ? (
        <DisinabPlate className="disinab-topic__intro-body" aura={false}>
          <ArticleBody body={topic.introContent} />
        </DisinabPlate>
      ) : null}

      {topic.children.length > 0 ? (
        <DisinabPlate className="disinab-topic__section" aura={false}>
          <h2>زیرموضوع‌ها</h2>
          <ul className="disinab-topics__grid">
            {topic.children.map((child) => (
              <li key={child.id}>
                <Link href={child.href} className="disinab-topics__card">
                  <strong>{child.name}</strong>
                  {child.description ? <p>{child.description}</p> : null}
                </Link>
              </li>
            ))}
          </ul>
        </DisinabPlate>
      ) : null}

      <DisinabPlate className="disinab-topic__section" aura={false}>
        <h2>دوره‌های مرتبط</h2>
        {topic.courses.items.length === 0 ? (
          <p className="disinab-topics__empty">دوره‌ای به این موضوع وصل نیست.</p>
        ) : (
          <div className="course-grid">
            {topic.courses.items.map((course) => (
              <CourseCardLink key={course.id} course={course} />
            ))}
          </div>
        )}
      </DisinabPlate>

      <DisinabPlate className="disinab-topic__section" aura={false}>
        <h2>مقالات مرتبط</h2>
        {topic.articles.items.length === 0 ? (
          <p className="disinab-topics__empty">مقاله‌ای به این موضوع وصل نیست.</p>
        ) : (
          <div className="note-grid">
            {topic.articles.items.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </DisinabPlate>

      {topic.relatedTopics.length > 0 ? (
        <DisinabPlate className="disinab-topic__section" aura={false}>
          <h2>موضوعات مرتبط</h2>
          <ul className="disinab-topics__grid">
            {topic.relatedTopics.map((rel) => (
              <li key={rel.id}>
                <Link href={rel.href} className="disinab-topics__card">
                  <strong>{rel.name}</strong>
                  {rel.description ? <p>{rel.description}</p> : null}
                </Link>
              </li>
            ))}
          </ul>
        </DisinabPlate>
      ) : null}

      {topic.courses.totalPages > 1 || topic.articles.totalPages > 1 ? (
        <nav className="disinab-topics__pager" aria-label="صفحه‌بندی">
          {page > 1 ? (
            <Link href={`/topics/${topic.slug}?page=${page - 1}`}>قبلی</Link>
          ) : null}
          <span>صفحه {page.toLocaleString("fa-IR")}</span>
          {page <
          Math.max(topic.courses.totalPages, topic.articles.totalPages) ? (
            <Link href={`/topics/${topic.slug}?page=${page + 1}`}>بعدی</Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
