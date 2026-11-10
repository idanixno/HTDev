import type { Metadata } from "next";
import Link from "next/link";
import { CatalogFilters } from "../../components/catalog-filters";
import { CourseCardLink } from "../../components/course-card-link";
import { DisinabBadge, DisinabPlate } from "../../components/disinab";
import { fetchCategories, fetchCourses } from "../../lib/catalog";
import { buildPageMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "دوره‌های ژرفا",
  description:
    "کاتالوگ دوره‌های ژرفا — فیلتر بر اساس قلمرو، وضعیت انتشار، و جستجو در عنوان و خلاصه.",
  path: "/courses",
});

const OFFER_FILTERS = [
  { value: "", label: "همه وضعیت‌ها" },
  { value: "PAID", label: "پولی" },
  { value: "FREE", label: "رایگان" },
  { value: "PRE_SALE", label: "پیش‌فروش" },
  { value: "COMING_SOON", label: "به‌زودی" },
] as const;

type SearchParams = Promise<{
  q?: string;
  category?: string;
  offer?: string;
  page?: string;
}>;

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const category = sp.category?.trim() || undefined;
  const offer = sp.offer?.trim() || undefined;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const [categories, result] = await Promise.all([
    fetchCategories(),
    fetchCourses({ q, category, offer, page, pageSize: 12 }),
  ]);

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = {
      q: q ?? "",
      category: category ?? "",
      offer: offer ?? "",
      page: String(page),
      ...overrides,
    };
    for (const [key, value] of Object.entries(merged)) {
      if (value && !(key === "page" && value === "1")) next.set(key, value);
    }
    const qs = next.toString();
    return qs ? `/courses?${qs}` : "/courses";
  };

  const pill = (active: boolean) =>
    "catalog-pill" + (active ? " catalog-pill--active" : "");
  const activeFilters = [category, offer].filter(Boolean).length;
  const filtered = Boolean(q || activeFilters);

  return (
    <div className="catalog catalog-stage disinab-catalog">
      <DisinabPlate
        className="disinab-catalog__mast"
        aria-labelledby="catalog-title"
      >
        <nav className="crumbs disinab-catalog__crumbs" aria-label="مسیر">
          <Link href="/">خانه</Link>
          <span aria-hidden="true">/</span>
          <span>دوره‌ها</span>
        </nav>
        <div className="disinab-catalog__intro">
          <div>
            <h1 id="catalog-title">دوره‌ها</h1>
            <p className="disinab__line">
              فیلتر بر اساس قلمرو و وضعیت؛ هر دوره جدا قابل خرید است.
            </p>
          </div>
          <div className="disinab-catalog__meta">
            <DisinabBadge tone="accent">
              {result.total.toLocaleString("fa-IR")} دوره
            </DisinabBadge>
          </div>
        </div>
        <form className="catalog-search disinab-catalog__search" method="get" role="search">
          <label className="visually-hidden" htmlFor="catalog-search">
            جستجو
          </label>
          <input
            id="catalog-search"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="جستجو در دوره‌ها"
            autoComplete="off"
            maxLength={100}
          />
          {category ? (
            <input type="hidden" name="category" value={category} />
          ) : null}
          {offer ? <input type="hidden" name="offer" value={offer} /> : null}
          <button type="submit">جستجو</button>
        </form>
      </DisinabPlate>

      <DisinabPlate className="disinab-catalog__filters" aura={false}>
        <CatalogFilters active={activeFilters}>
          <div
            className="catalog-rail catalog-rail--live disinab-catalog__rail"
            aria-label="فیلتر دوره‌ها"
          >
            <div className="catalog-rail__line">
              <p>قلمرو</p>
              <ul>
                <li>
                  <Link
                    href={buildHref({ category: "", page: "1" })}
                    className={pill(!category)}
                  >
                    همه ({categories.reduce((n, c) => n + c.courseCount, 0)})
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={buildHref({ category: cat.slug, page: "1" })}
                      className={pill(category === cat.slug)}
                    >
                      {cat.title} ({cat.courseCount})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="catalog-rail__line">
              <p>وضعیت</p>
              <ul>
                {OFFER_FILTERS.map((item) => (
                  <li key={item.value || "all"}>
                    <Link
                      href={buildHref({ offer: item.value, page: "1" })}
                      className={pill((offer ?? "") === item.value)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CatalogFilters>
      </DisinabPlate>

      <DisinabPlate
        className="disinab-catalog__results"
        aura={false}
        as="section"
        aria-live="polite"
      >
        {filtered ? (
          <div className="catalog-bar disinab-catalog__bar">
            <p>
              {result.total.toLocaleString("fa-IR")} دوره
              {q ? ` برای «${q}»` : ""}
            </p>
            <Link href="/courses">پاک کردن فیلترها</Link>
          </div>
        ) : null}

        {result.items.length === 0 ? (
          <p className="catalog-empty">
            دوره‌ای با این فیلترها نیست. یک فیلتر را بردارید یا عبارت جستجو را عوض
            کنید.
          </p>
        ) : (
          <ul className="catalog__grid disinab-catalog__grid">
            {result.items.map((course) => (
              <li key={course.id}>
                <CourseCardLink course={course} />
              </li>
            ))}
          </ul>
        )}

        {result.totalPages > 1 ? (
          <nav className="catalog-pages disinab-catalog__pages" aria-label="صفحه‌بندی">
            {page > 1 ? (
              <Link href={buildHref({ page: String(page - 1) })}>قبلی</Link>
            ) : (
              <span>قبلی</span>
            )}
            <strong>
              {page.toLocaleString("fa-IR")} از{" "}
              {result.totalPages.toLocaleString("fa-IR")}
            </strong>
            {page < result.totalPages ? (
              <Link href={buildHref({ page: String(page + 1) })}>بعدی</Link>
            ) : (
              <span>بعدی</span>
            )}
          </nav>
        ) : null}
      </DisinabPlate>
    </div>
  );
}
