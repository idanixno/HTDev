import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "../../../../components/article-body";
import { PathRoadmapTable } from "../../../../components/path-roadmap";
import { DisinabFacts, DisinabPlate } from "../../../../components/disinab";
import { fetchPath } from "../../../../lib/catalog";
import { buildPageMetadata } from "../../../../lib/seo";

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
      description: "این مسیر یادگیری در DXCode موجود نیست.",
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
  const lead = path.description ?? path.summary;

  return (
    <article className="path-detail path-detail--live disinab-path-detail disinab-roadmap">
      <DisinabPlate
        className="disinab-roadmap__article"
        aria-labelledby="path-detail-title"
      >
        <nav className="crumbs disinab-roadmap__crumbs" aria-label="مسیر">
          <Link href="/">خانه</Link>
          <span aria-hidden="true">/</span>
          <Link href="/paths">نقشهٔ راه</Link>
          <span aria-hidden="true">/</span>
          <span>{path.title}</span>
        </nav>

        <header className="disinab-roadmap__head">
          <h1 id="path-detail-title">{path.title}</h1>
          {lead ? (
            <div className="disinab-roadmap__lead">
              <ArticleBody body={lead} />
            </div>
          ) : null}
          {path.summary &&
          path.description &&
          path.summary !== path.description ? (
            <p className="disinab-roadmap__lead disinab-roadmap__lead--secondary">
              {path.summary}
            </p>
          ) : null}
          {steps.length > 0 ? (
            <DisinabFacts
              items={[
                {
                  label: "گام‌ها",
                  value: steps.length.toLocaleString("fa-IR"),
                },
                {
                  label: "ترتیب",
                  value: "پیشنهادی",
                },
              ]}
            />
          ) : null}
        </header>

        {path.coverAsset ? (
          <figure className="disinab-roadmap__cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={path.coverAsset} alt="" />
          </figure>
        ) : null}

        {steps.length > 0 ? (
          <section
            className="disinab-roadmap__section"
            aria-labelledby="path-courses-heading"
          >
            <div className="disinab-roadmap__section-head">
              <h2 id="path-courses-heading" className="disinab-roadmap__section-title">
                ترتیب دوره‌ها
              </h2>
              <p className="disinab-roadmap__prose">
                دوره‌های زیر را به ترتیب ببینید. در یادگیری عجله نکنید و هر مرحله را
                قبل از رفتن به گام بعد درک کنید.
              </p>
            </div>
            <PathRoadmapTable steps={steps} />
          </section>
        ) : null}
      </DisinabPlate>
    </article>
  );
}
