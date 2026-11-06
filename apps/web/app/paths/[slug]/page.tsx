import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseCardLink } from "../../../components/course-card-link";
import { fetchPath } from "../../../lib/catalog";
import { buildPageMetadata } from "../../../lib/seo";

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

  return (
    <article className="path-detail">
      <header className="path-detail__intro">
        <p className="path-detail__eyebrow">مسیر یادگیری</p>
        <h1 className="path-detail__title">{path.title}</h1>
        {path.summary ? <p className="path-detail__summary">{path.summary}</p> : null}
        {path.description ? (
          <p className="path-detail__description">{path.description}</p>
        ) : null}
      </header>

      <ol className="path-detail__steps">
        {(path.steps ?? []).map((step) => (
          <li key={step.id} className="path-detail__step">
            <div className="path-detail__step-copy">
              <p className="path-detail__step-index">
                گام {step.sortOrder.toLocaleString("fa-IR")}
              </p>
              <h2>{step.title}</h2>
              {step.summary ? <p>{step.summary}</p> : null}
              {step.course ? (
                <p>
                  <Link href={step.course.href}>مشاهده دوره ←</Link>
                </p>
              ) : null}
            </div>
            {step.course ? <CourseCardLink course={step.course} /> : null}
          </li>
        ))}
      </ol>

      <p className="path-detail__back">
        <Link href="/paths">← همه مسیرها</Link>
      </p>
    </article>
  );
}
