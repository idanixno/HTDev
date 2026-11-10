import type { Metadata } from "next";
import Link from "next/link";
import { PathRoadmapSection } from "../../../components/path-roadmap";
import { DisinabPlate } from "../../../components/disinab";
import {
  fetchPath,
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
      "ترتیب پیشنهادی دوره‌های ژرفا.",
    path: "/paths",
  });
}

export default async function PathsPage() {
  const [page, listed] = await Promise.all([
    fetchPathsPageCms(),
    fetchPaths(),
  ]);
  const paths = (
    await Promise.all(listed.map((item) => fetchPath(item.slug)))
  ).filter((path): path is NonNullable<typeof path> => Boolean(path));

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

        {paths.length === 0 ? (
          <p className="disinab__line">مسیر منتشرشده‌ای در دسترس نیست.</p>
        ) : (
          <div className="disinab-roadmap__stack">
            {paths.map((path) => (
              <PathRoadmapSection key={path.id} path={path} />
            ))}
          </div>
        )}
      </DisinabPlate>
    </div>
  );
}
