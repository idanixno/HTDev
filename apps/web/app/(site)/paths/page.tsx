import type { Metadata } from "next";
import Link from "next/link";
import { DisinabPlate } from "../../../components/disinab";
import {
  fetchPaths,
  fetchPathsPageCms,
} from "../../../lib/catalog";
import { buildPageMetadata } from "../../../lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPathsPageCms();
  return buildPageMetadata({
    title: page.seoTitle?.trim() || page.title,
    description:
      page.seoDescription?.trim() ||
      page.lead?.trim() ||
      "ترتیب پیشنهادی دوره‌های DXCode.",
    path: "/paths",
  });
}

export default async function PathsPage() {
  const [page, listed] = await Promise.all([
    fetchPathsPageCms(),
    fetchPaths(),
  ]);

  return (
    <div className="paths disinab-paths disinab-roadmap">
      <DisinabPlate className="disinab-roadmap__article" aria-labelledby="paths-title">
        <nav className="crumbs disinab-roadmap__crumbs" aria-label="مسیر">
          <Link href="/">خانه</Link>
          <span aria-hidden="true">/</span>
          <span>نقشهٔ راه</span>
        </nav>

        <header className="disinab-roadmap__head">
          <h1 id="paths-title">{page.title}</h1>
          {page.lead ? (
            <p className="disinab-roadmap__lead">{page.lead}</p>
          ) : null}
        </header>

        {listed.length === 0 ? (
          <p className="disinab__line">مسیر منتشرشده‌ای در دسترس نیست.</p>
        ) : (
          <ul className="path-index disinab-roadmap__path-index">
            {listed.map((path) => (
              <li key={path.id}>
                <Link
                  className="path-card disinab-roadmap__path-card"
                  href={path.href}
                >
                  {path.coverAsset ? (
                    <span className="path-card__media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={path.coverAsset} alt="" />
                    </span>
                  ) : null}
                  <span className="path-card__body">
                    {path.stepCount > 0 ? (
                      <span className="path-card__count">
                        {path.stepCount.toLocaleString("fa-IR")} گام
                      </span>
                    ) : null}
                    <strong>{path.title}</strong>
                    {path.summary ? (
                      <span className="path-card__summary">{path.summary}</span>
                    ) : null}
                    <span className="disinab-roadmap__path-action">
                      مشاهدهٔ مسیر
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DisinabPlate>
    </div>
  );
}
