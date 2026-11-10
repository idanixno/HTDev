import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { DisinabBadge, DisinabPlate } from "../../../components/disinab";
import {
  fetchPath,
  formatCourseDuration,
  type PublicCourseCard,
} from "../../../lib/catalog";
import { buildPageMetadata } from "../../../lib/seo";

function offerTone(kind: PublicCourseCard["offerKind"]) {
  if (kind === "FREE") return "free";
  if (kind === "PRE_SALE") return "presale";
  if (kind === "COMING_SOON") return "soon";
  return "sale";
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = await fetchPath(slug);
  if (!path) {
    return buildPageMetadata({
      title: "مسیر یافت نشد",
      description: "این مسیر یادگیری در ژرفا موجود نیست.",
      path: `/paths/${slug}`,
      noIndex: true,
    });
  }
  return buildPageMetadata({
    title: path.title,
    description: path.summary ?? path.description ?? path.title,
    path: path.href,
    imagePath: path.coverAsset,
  });
}

export default async function PathDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const path = await fetchPath(slug);
  if (!path) notFound();
  const steps = path.steps ?? [];

  return (
    <article className="path-detail path-detail--live disinab-path-detail">
      <DisinabPlate
        className="disinab-path-detail__hero"
        aria-labelledby="path-detail-title"
      >
        <nav className="crumbs disinab-path-detail__crumbs" aria-label="مسیر">
          <Link href="/">خانه</Link>
          <span aria-hidden="true">/</span>
          <Link href="/paths">مسیرها</Link>
          <span aria-hidden="true">/</span>
          <span>{path.title}</span>
        </nav>
        <div className="disinab-path-detail__intro">
          <div>
            <p className="disinab__brand">مسیر یادگیری</p>
            <h1 id="path-detail-title">{path.title}</h1>
            {path.summary ? (
              <p className="disinab__line">{path.summary}</p>
            ) : null}
            {path.description ? (
              <p className="disinab-path-detail__note">{path.description}</p>
            ) : null}
          </div>
          <div className="disinab-path-detail__meta">
            <DisinabBadge tone="accent">
              {steps.length.toLocaleString("fa-IR")} گام
            </DisinabBadge>
            <DisinabBadge tone="muted">نقشهٔ راه ژرفا</DisinabBadge>
          </div>
        </div>
      </DisinabPlate>

      {steps.length === 0 ? (
        <DisinabPlate className="disinab-path-detail__empty" aura={false}>
          <p className="disinab__line">گامی برای این مسیر ثبت نشده است.</p>
        </DisinabPlate>
      ) : (
        <ol className="path-rail disinab-path-detail__rail">
          {steps.map((step, index) => {
            const course = step.course;
            const duration = course
              ? formatCourseDuration(course.durationHours)
              : null;
            return (
              <li
                key={step.id}
                style={{ "--path-i": index } as CSSProperties}
              >
                <span className="path-rail__mark">
                  {step.sortOrder.toLocaleString("fa-IR")}
                </span>
                <div className="path-rail__card disinab-path-detail__card">
                  <p className="path-rail__kicker disinab__brand">
                    گام {(index + 1).toLocaleString("fa-IR")}
                  </p>
                  <h2>
                    <Link href={step.href}>{step.title}</Link>
                  </h2>
                  {step.summary ? <p>{step.summary}</p> : null}
                  {course ? (
                    <Link
                      className="path-course disinab-path-detail__course"
                      href={course.href}
                      data-offer={offerTone(course.offerKind)}
                    >
                      {course.coverAsset ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={course.coverAsset} alt="" />
                      ) : (
                        <span
                          className="path-course__fallback"
                          aria-hidden="true"
                        >
                          ژرفا
                        </span>
                      )}
                      <span className="path-course__copy">
                        <strong>{course.title}</strong>
                        <span>
                          {duration ? <span>{duration}</span> : null}
                          <span className="path-course__price">
                            {course.priceLabel}
                          </span>
                        </span>
                      </span>
                    </Link>
                  ) : (
                    <p className="path-rail__missing">
                      دوره‌ای به این گام وصل نیست.
                    </p>
                  )}
                  <Link
                    className="path-rail__more disinab-path-detail__more"
                    href={step.href}
                  >
                    شرح این گام
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}
