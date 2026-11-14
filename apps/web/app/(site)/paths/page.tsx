import type { Metadata } from "next";
import Link from "next/link";
import { DisinabPlate } from "../../../components/disinab";
import { PathArtwork } from "../../../components/path-roadmap";
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

        <header className="disinab-roadmap__head disinab-roadmap__index-head">
          <span className="disinab-roadmap__index-kicker">
            <span className="disinab-roadmap__index-mark" aria-hidden="true">
              <PathArtwork />
            </span>
            یادگیری مرحله‌به‌مرحله
          </span>
          <h1 id="paths-title">{page.title}</h1>
          {page.lead ? (
            <p className="disinab-roadmap__lead">{page.lead}</p>
          ) : null}
          {listed.length > 0 ? (
            <span className="disinab-roadmap__index-count">
              {listed.length.toLocaleString("fa-IR")} مسیر برای انتخاب
            </span>
          ) : null}
        </header>

        {listed.length === 0 ? (
          <p className="disinab__line">مسیر منتشرشده‌ای در دسترس نیست.</p>
        ) : (
          <ul className="path-index disinab-roadmap__path-index">
            {listed.map((path, index) => (
              <li key={path.id}>
                <Link
                  className="path-card disinab-roadmap__path-card"
                  href={path.href}
                >
                  <span className="path-card__media disinab-roadmap__card-art">
                    {path.coverAsset ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={path.coverAsset} alt="" />
                    ) : (
                      <PathArtwork />
                    )}
                    <span className="disinab-roadmap__art-label">
                      DXCODE <i /> LEARNING PATH
                    </span>
                  </span>
                  <span className="path-card__body">
                    <span className="disinab-roadmap__path-top">
                      <span className="disinab-roadmap__path-number" aria-hidden="true">
                        {(index + 1).toLocaleString("fa-IR", {
                          minimumIntegerDigits: 2,
                        })}
                      </span>
                      <span className="disinab-roadmap__path-kind">
                        نقشهٔ یادگیری
                      </span>
                      {path.stepCount > 0 ? (
                        <span className="path-card__count">
                          {path.stepCount.toLocaleString("fa-IR")} گام
                        </span>
                      ) : null}
                    </span>
                    <strong>{path.title}</strong>
                    {path.summary ? (
                      <span className="path-card__summary">{path.summary}</span>
                    ) : null}
                    <span className="disinab-roadmap__path-action">
                      مشاهدهٔ مسیر
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        aria-hidden="true"
                      >
                        <path
                          d="M15 5 8 12l7 7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
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
