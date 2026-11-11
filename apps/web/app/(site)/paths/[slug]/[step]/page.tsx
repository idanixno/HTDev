import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArticleBody } from "../../../../../components/article-body";
import { CourseCardLink } from "../../../../../components/course-card-link";
import {
  DisinabBadge,
  DisinabPlate,
} from "../../../../../components/disinab";
import {
  fetchCourse,
  fetchPath,
  fetchPathStep,
  type PublicCourseCard,
} from "../../../../../lib/catalog";
import {
  extractFaqItems,
  parseArticleMarkdown,
} from "../../../../../lib/article-markdown";
import { buildPageMetadata } from "../../../../../lib/seo";
import { ownedCourseSlugs } from "../../../../../lib/enrollment";
import { fetchCurrentUser } from "../../../../../lib/session";
import { absoluteUrl } from "../../../../../lib/site-url";

type Params = Promise<{ slug: string; step: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug, step: stepSlug } = await params;
  const page = await fetchPathStep(slug, stepSlug);
  if (!page) {
    return buildPageMetadata({
      title: "گام یافت نشد",
      description: "این گام در مسیر یادگیری موجود نیست.",
      path: `/paths/${slug}/${stepSlug}`,
      noIndex: true,
    });
  }
  return buildPageMetadata({
    title: page.step.seoTitle || page.step.title,
    description:
      page.step.seoDescription || page.step.summary || page.step.title,
    path: page.step.href,
    imagePath: page.step.ogImage || page.path.coverAsset,
    noIndex: page.step.noIndex,
  });
}

export default async function PathStepPage({ params }: { params: Params }) {
  const { slug, step: stepSlug } = await params;
  const page = await fetchPathStep(slug, stepSlug);
  if (!page) notFound();

  const [pathIndex, user] = await Promise.all([
    fetchPath(slug),
    fetchCurrentUser(),
  ]);
  const owned = user ? await ownedCourseSlugs() : new Set<string>();
  const pathSteps = pathIndex?.steps ?? [];

  const blocks = parseArticleMarkdown(page.step.body);
  const embedded = new Set(
    blocks.flatMap((block) => (block.type === "course" ? [block.slug] : [])),
  );
  const courses: Record<string, ReactNode> = {};
  await Promise.all(
    [...embedded].map(async (courseSlug) => {
      const course = await fetchCourse(courseSlug);
      if (course) {
        courses[courseSlug] = (
          <CourseCardLink
            course={course}
            enrolled={owned.has(course.slug)}
          />
        );
      }
    }),
  );
  const lead = page.step.course;
  const showLead = Boolean(lead && !embedded.has(lead.slug));
  const faqs = extractFaqItems(blocks);

  const share = page.step.ogImage || page.path.coverAsset;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "خانه",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "مسیرها",
            item: absoluteUrl("/paths"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: page.path.title,
            item: absoluteUrl(page.path.href),
          },
          {
            "@type": "ListItem",
            position: 4,
            name: page.step.title,
            item: absoluteUrl(page.step.href),
          },
        ],
      },
      {
        "@type": "Article",
        headline: page.step.seoTitle || page.step.title,
        description:
          page.step.seoDescription || page.step.summary || page.step.title,
        inLanguage: "fa",
        mainEntityOfPage: absoluteUrl(page.step.href),
        image: share
          ? share.startsWith("http")
            ? share
            : absoluteUrl(share)
          : undefined,
        author: { "@type": "Person", name: "آرمان راد" },
        isPartOf: {
          "@type": "CreativeWork",
          name: page.path.title,
          url: absoluteUrl(page.path.href),
        },
      },
      ...(faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <article className="reading reading--path disinab-reading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DisinabPlate
        className="disinab-reading__hero"
        aria-labelledby="path-step-title"
      >
        <nav className="crumbs disinab-reading__crumbs" aria-label="مسیر">
          <Link href="/">خانه</Link>
          <span aria-hidden="true">/</span>
          <Link href="/paths">مسیرها</Link>
          <span aria-hidden="true">/</span>
          <Link href={page.path.href}>{page.path.title}</Link>
        </nav>
        <div className="disinab-reading__intro">
          <div>
            <h1 id="path-step-title">{page.step.title}</h1>
            {page.step.summary ? (
              <p className="disinab__line">{page.step.summary}</p>
            ) : null}
            <p className="reading__byline disinab-reading__byline">
              <span>
                <Link href={page.path.href}>{page.path.title}</Link>
              </span>
              {lead ? (
                <span>
                  <Link href={lead.href}>{lead.title}</Link>
                </span>
              ) : null}
            </p>
          </div>
          <div className="disinab-reading__meta">
            <DisinabBadge tone="accent">خواندن گام</DisinabBadge>
            {pathSteps.length > 0 ? (
              <DisinabBadge tone="muted">
                {pathSteps.length.toLocaleString("fa-IR")} گام در مسیر
              </DisinabBadge>
            ) : null}
          </div>
        </div>
      </DisinabPlate>

      <div className="disinab-reading__layout">
        <aside className="disinab-reading__toc" aria-label="فهرست گام‌ها">
          <DisinabPlate className="disinab-reading__panel" aura={false}>
            <p className="disinab-reading__panel-title">
              <Link href={page.path.href}>{page.path.title}</Link>
            </p>
            {pathSteps.length > 0 ? (
              <ol className="disinab-reading__steps">
                {pathSteps.map((item) => {
                  const current = item.slug === page.step.slug;
                  return (
                    <li key={item.id} data-current={current ? "1" : "0"}>
                      <Link href={item.href} aria-current={current ? "page" : undefined}>
                        <span className="disinab-reading__step-index">
                          {item.sortOrder.toLocaleString("fa-IR")}
                        </span>
                        <span className="disinab-reading__step-copy">
                          <strong>{item.title}</strong>
                          {item.summary ? <em>{item.summary}</em> : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="disinab__line">فهرست گام‌ها در دسترس نیست.</p>
            )}
          </DisinabPlate>
        </aside>

        <div className="disinab-reading__main">
          <DisinabPlate className="disinab-reading__sheet" aura={false}>
            {page.step.body.trim() ? (
              <ArticleBody body={page.step.body} courses={courses} />
            ) : (
              <p className="empty-note">متن این گام هنوز نوشته نشده است.</p>
            )}

            <nav className="step-pager disinab-reading__pager" aria-label="گام‌های کنار">
              {page.previous ? (
                <Link className="step-pager__link" href={page.previous.href}>
                  <span className="step-pager__dir">گام قبل</span>
                  <strong>{page.previous.title}</strong>
                </Link>
              ) : (
                <span className="step-pager__ghost" aria-hidden="true" />
              )}
              {page.next ? (
                <Link
                  className="step-pager__link step-pager__link--next"
                  href={page.next.href}
                >
                  <span className="step-pager__dir">گام بعد</span>
                  <strong>{page.next.title}</strong>
                </Link>
              ) : (
                <span className="step-pager__ghost" aria-hidden="true" />
              )}
            </nav>
          </DisinabPlate>
        </div>

        <aside className="disinab-reading__rail" aria-label="دوره و ادامه">
          {showLead && lead ? (
            <DisinabPlate className="disinab-reading__panel" aura={false}>
              <div className="disinab-reading__course">
                <CourseCardLink
                  course={lead as PublicCourseCard}
                  enrolled={owned.has(lead.slug)}
                />
              </div>
            </DisinabPlate>
          ) : null}

          {page.next ? (
            <DisinabPlate className="disinab-reading__panel" aura={false}>
              <Link className="disinab-reading__next" href={page.next.href}>
                <strong>{page.next.title}</strong>
                <span>ادامه مسیر</span>
              </Link>
            </DisinabPlate>
          ) : (
            <DisinabPlate className="disinab-reading__panel" aura={false}>
              <p className="disinab__line">
                این آخرین گام است. به{" "}
                <Link href={page.path.href}>صفحهٔ مسیر</Link> برگردید.
              </p>
            </DisinabPlate>
          )}
        </aside>
      </div>
    </article>
  );
}
