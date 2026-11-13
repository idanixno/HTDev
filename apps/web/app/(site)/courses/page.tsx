import type { Metadata } from "next";
import Link from "next/link";
import { CatalogFilters } from "../../../components/catalog-filters";
import { CourseCardLink } from "../../../components/course-card-link";
import { DisinabPlate } from "../../../components/disinab";
import {
  fetchCategories,
  fetchCourses,
  fetchTopics,
} from "../../../lib/catalog";
import { buildPageMetadata } from "../../../lib/seo";
import { ownedCourseSlugs } from "../../../lib/enrollment";
import { fetchCurrentUser } from "../../../lib/session";

export const metadata: Metadata = buildPageMetadata({
  title: "دوره‌ها",
  description:
    "کاتالوگ دوره‌های DXCode — فیلتر بر اساس قلمرو، موضوع، وضعیت انتشار، و جستجو در عنوان و خلاصه.",
  path: "/courses",
});

const OFFER_FILTERS = [
  { value: "", label: "همه" },
  { value: "PAID", label: "پولی" },
  { value: "FREE", label: "رایگان" },
  { value: "PRE_SALE", label: "پیش‌فروش" },
  { value: "COMING_SOON", label: "به‌زودی" },
] as const;

type SearchParams = Promise<{
  q?: string;
  category?: string;
  topic?: string;
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
  const topic = sp.topic?.trim() || undefined;
  const offer = sp.offer?.trim() || undefined;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const [categories, topicsResult, result, user] = await Promise.all([
    fetchCategories(),
    fetchTopics({ page: 1, pageSize: 48 }),
    fetchCourses({ q, category, topic, offer, page, pageSize: 12 }),
    fetchCurrentUser(),
  ]);
  const owned = user ? await ownedCourseSlugs() : new Set<string>();
  const topics = topicsResult.items;

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = {
      q: q ?? "",
      category: category ?? "",
      topic: topic ?? "",
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

  const chip = (active: boolean) =>
    "catalog-chip" + (active ? " catalog-chip--active" : "");
  const activeFilters = [category, topic, offer].filter(Boolean).length;
  const filtered = Boolean(q || activeFilters);
  const allCount = categories.reduce((n, c) => n + c.courseCount, 0);
  const activeCategory = categories.find((c) => c.slug === category);
  const activeTopic = topics.find((t) => t.slug === topic);
  const activeOffer = OFFER_FILTERS.find((item) => item.value === (offer ?? ""));

  const topicRail =
    topics.length > 0 ? (
      <section
        className="disinab-catalog__rail"
        aria-labelledby="catalog-rail-topic"
      >
        <div className="disinab-catalog__rail-head">
          <div>
            <p id="catalog-rail-topic" className="disinab-catalog__rail-label">
              موضوع
            </p>
            <p className="disinab-catalog__rail-hint">هاب‌های موضوعی</p>
          </div>
          <span className="disinab-catalog__rail-count">
            {topics.length.toLocaleString("fa-IR")} موضوع
          </span>
        </div>
        <div className="disinab-catalog__seg" role="list">
          <Link
            href={buildHref({ topic: "", page: "1" })}
            className={chip(!topic)}
            role="listitem"
          >
            همه
          </Link>
          {topics.map((item) => (
            <Link
              key={item.id}
              href={buildHref({ topic: item.slug, page: "1" })}
              className={chip(topic === item.slug)}
              role="listitem"
            >
              {item.name}
              <em>{item.courseCount.toLocaleString("fa-IR")}</em>
            </Link>
          ))}
        </div>
      </section>
    ) : null;

  const categoryRail = (
    <section
      className="disinab-catalog__rail"
      aria-labelledby="catalog-rail-realm"
    >
      <div className="disinab-catalog__rail-head">
        <div>
          <p id="catalog-rail-realm" className="disinab-catalog__rail-label">
            دسته‌بندی
          </p>
          <p className="disinab-catalog__rail-hint">موضوع دوره‌ها</p>
        </div>
        <span className="disinab-catalog__rail-count">
          {categories.length.toLocaleString("fa-IR")} گروه
        </span>
      </div>
      <div className="disinab-catalog__seg" role="list">
        <Link
          href={buildHref({ category: "", page: "1" })}
          className={chip(!category)}
          role="listitem"
        >
          همه
          <em>{allCount.toLocaleString("fa-IR")}</em>
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={buildHref({ category: cat.slug, page: "1" })}
            className={chip(category === cat.slug)}
            role="listitem"
          >
            {cat.title}
            <em>{cat.courseCount.toLocaleString("fa-IR")}</em>
          </Link>
        ))}
      </div>
    </section>
  );

  const statusRail = (
    <section
      className="disinab-catalog__rail"
      aria-labelledby="catalog-rail-offer"
    >
      <div className="disinab-catalog__rail-head">
        <div>
          <p id="catalog-rail-offer" className="disinab-catalog__rail-label">
            وضعیت
          </p>
          <p className="disinab-catalog__rail-hint">نوع دسترسی و فروش</p>
        </div>
      </div>
      <div
        className="disinab-catalog__seg disinab-catalog__seg--status"
        role="list"
      >
        {OFFER_FILTERS.map((item) => (
          <Link
            key={item.value || "all"}
            href={buildHref({ offer: item.value, page: "1" })}
            className={chip((offer ?? "") === item.value)}
            role="listitem"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <div className="catalog catalog-stage disinab-catalog">
      <DisinabPlate
        className="disinab-catalog__mast"
        aria-labelledby="catalog-title"
      >
        <div className="disinab-catalog__layout">
          <div className="disinab-catalog__lead">
            <header className="disinab-catalog__head">
              <nav className="crumbs disinab-catalog__crumbs" aria-label="مسیر">
                <Link href="/">خانه</Link>
                <span aria-hidden="true">/</span>
                <span>دوره‌ها</span>
              </nav>
            </header>

            <div className="disinab-catalog__intro">
              <div className="disinab-catalog__intro-copy">
                <h1 id="catalog-title">دوره‌ها</h1>
                <p className="disinab__line">
                  جستجو در عنوان و خلاصه، فیلتر با قلمرو و وضعیت.
                </p>
              </div>
            </div>
          </div>

          <div className="disinab-catalog__console">
            <form
              className="disinab-catalog__query"
              method="get"
              role="search"
            >
              <span className="disinab-catalog__method" aria-hidden="true">
                جستجو
              </span>
              <label className="visually-hidden" htmlFor="catalog-search">
                جستجوی دوره
              </label>
              <input
                id="catalog-search"
                name="q"
                type="search"
                defaultValue={q ?? ""}
                placeholder="عنوان، موضوع یا بخشی از خلاصه…"
                autoComplete="off"
                maxLength={100}
              />
              {category ? (
                <input type="hidden" name="category" value={category} />
              ) : null}
              {offer ? <input type="hidden" name="offer" value={offer} /> : null}
              {topic ? <input type="hidden" name="topic" value={topic} /> : null}
              <button type="submit">بیاب</button>
            </form>

            <CatalogFilters
              menus={[
                {
                  id: "category",
                  label: "دسته‌بندی",
                  hint: "قلمرو موضوع دوره‌ها",
                  active: Boolean(category),
                  valueLabel: activeCategory?.title ?? "همه",
                  children: categoryRail,
                },
                ...(topicRail
                  ? [
                      {
                        id: "topic",
                        label: "موضوع",
                        hint: "هاب موضوعی",
                        active: Boolean(topic),
                        valueLabel: activeTopic?.name ?? "همه",
                        children: topicRail,
                      },
                    ]
                  : []),
                {
                  id: "status",
                  label: "وضعیت",
                  hint: "نوع دسترسی و فروش",
                  active: Boolean(offer),
                  valueLabel: activeOffer?.label ?? "همه",
                  children: statusRail,
                },
              ]}
            />

            {filtered ? (
              <div className="disinab-catalog__active">
                <p className="disinab-catalog__active-label">فیلترهای فعال</p>
                <div className="disinab-catalog__active-tags">
                  {q ? <span>عبارت: «{q}»</span> : null}
                  {activeCategory ? (
                    <span>دسته: {activeCategory.title}</span>
                  ) : null}
                  {activeTopic ? <span>موضوع: {activeTopic.name}</span> : null}
                  {activeOffer && activeOffer.value ? (
                    <span>وضعیت: {activeOffer.label}</span>
                  ) : null}
                  <Link href="/courses">پاک کردن همه</Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
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
            <Link href="/courses">بازنشانی</Link>
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
                <CourseCardLink
                  course={course}
                  enrolled={owned.has(course.slug)}
                />
              </li>
            ))}
          </ul>
        )}

        {result.totalPages > 1 ? (
          <nav
            className="catalog-pages disinab-catalog__pages"
            aria-label="صفحه‌بندی"
          >
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
