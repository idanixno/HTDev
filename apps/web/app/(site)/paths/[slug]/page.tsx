import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "../../../../components/article-body";
import { PathArtwork, PathRoadmapTable } from "../../../../components/path-roadmap";
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
  const lead = path.summary;

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

        <header className="disinab-roadmap__head disinab-roadmap__detail-head">
          <span className="disinab-roadmap__detail-kicker">
            <span className="disinab-roadmap__detail-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path
                  d="M5 19V5m0 14h14M5 5l5 4 4-3 5 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="5" cy="5" r="1.5" fill="currentColor" />
                <circle cx="19" cy="10" r="1.5" fill="currentColor" />
              </svg>
            </span>
            نقشهٔ مسیر یادگیری
          </span>
          <h1 id="path-detail-title">{path.title}</h1>
          {lead ? (
            <p className="disinab-roadmap__lead">{lead}</p>
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

        <figure
          className={
            "disinab-roadmap__cover" +
            (path.coverAsset ? "" : " disinab-roadmap__cover--abstract")
          }
        >
          {path.coverAsset ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={path.coverAsset} alt="" />
          ) : (
            <PathArtwork />
          )}
          <span className="disinab-roadmap__cover-label">
            DXCODE <i /> LEARNING PATH
          </span>
        </figure>

        {path.description ? (
          <section
            className="disinab-roadmap__description-panel"
            aria-labelledby="path-description-heading"
          >
            <h2
              id="path-description-heading"
              className="disinab-roadmap__section-title"
            >
              دربارهٔ این مسیر
            </h2>
            <div className="disinab-roadmap__description">
              <ArticleBody body={path.description} />
            </div>
          </section>
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
