import type { Metadata } from "next";
import Link from "next/link";
import { DisinabBadge, DisinabMark, DisinabPlate } from "../../../components/disinab";
import { fetchTopics } from "../../../lib/catalog";
import { buildPageMetadata } from "../../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "موضوعات",
  description:
    "هاب‌های موضوعی DXCode — مسیرهای موضوعی برای کشف دوره و مقاله، مستقل از دسته‌بندی کاتالوگ.",
  path: "/topics",
});

export default async function TopicsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const data = await fetchTopics({ q: sp.q, page, pageSize: 24 });

  return (
    <div className="topics disinab-topics">
      <DisinabPlate className="disinab-topics__mast" aria-labelledby="topics-heading">
        <nav className="crumbs disinab-topics__crumbs" aria-label="مسیر">
          <Link href="/">خانه</Link>
          <span aria-hidden="true">/</span>
          <span>موضوعات</span>
        </nav>
        <div className="disinab-topics__intro">
          <DisinabMark>DX</DisinabMark>
          <p className="disinab__brand">موضوعات</p>
          <div className="disinab-topics__title-row">
            <h1 id="topics-heading">هاب‌های یادگیری</h1>
            <DisinabBadge>{data.total.toLocaleString("fa-IR")} موضوع</DisinabBadge>
          </div>
          <p className="disinab__line">
            هر موضوع یک صفحهٔ فرود مستقل است: معرفی، زیرموضوع‌ها، دوره‌ها و مقالات مرتبط —
            بدون تغییر URL دوره‌ها.
          </p>
        </div>
      </DisinabPlate>

      <DisinabPlate className="disinab-topics__feed" aura={false}>
        {data.items.length === 0 ? (
          <p className="disinab-topics__empty">هنوز موضوع منتشرشده‌ای نیست.</p>
        ) : (
          <ul className="disinab-topics__grid">
            {data.items.map((topic) => (
              <li key={topic.id}>
                <Link href={topic.href} className="disinab-topics__card">
                  <span className="disinab-topics__card-kicker" dir="ltr">
                    /topics/{topic.slug}
                  </span>
                  <strong>{topic.h1 || topic.name}</strong>
                  {topic.description ? <p>{topic.description}</p> : null}
                  <span className="disinab-topics__card-meta">
                    {topic.courseCount.toLocaleString("fa-IR")} دوره ·{" "}
                    {topic.articleCount.toLocaleString("fa-IR")} مقاله
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {data.totalPages > 1 ? (
          <nav className="disinab-topics__pager" aria-label="صفحه‌بندی">
            {page > 1 ? (
              <Link href={`/topics?page=${page - 1}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}>
                قبلی
              </Link>
            ) : null}
            <span>
              صفحه {page.toLocaleString("fa-IR")} از{" "}
              {data.totalPages.toLocaleString("fa-IR")}
            </span>
            {page < data.totalPages ? (
              <Link href={`/topics?page=${page + 1}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}>
                بعدی
              </Link>
            ) : null}
          </nav>
        ) : null}
      </DisinabPlate>
    </div>
  );
}
