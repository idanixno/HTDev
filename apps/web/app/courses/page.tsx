import Link from "next/link";
import { Field } from "@zharfa/ui";
import { CourseCardLink } from "../../components/course-card-link";
import {
  fetchCategories,
  fetchCourses,
} from "../../lib/catalog";

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

  return (
    <div className="catalog">
      <header className="catalog__intro">
        <p className="catalog__eyebrow">۰۳ / کاتالوگ دوره‌ها</p>
        <h1 className="catalog__title">دوره‌های ژرفا</h1>
        <p className="catalog__lead">
          فیلتر بر اساس قلمرو، وضعیت انتشار تجاری، و جستجو در عنوان و خلاصه.
        </p>
      </header>

      <div className="catalog__layout">
        <aside className="catalog__filters" aria-label="فیلتر دوره‌ها">
          <form className="catalog__filter-form" method="get">
            <Field
              id="catalog-search"
              label="جستجو"
              name="q"
              defaultValue={q ?? ""}
              placeholder="مثلاً معماری، لینوکس، API"
            />
            {category ? (
              <input type="hidden" name="category" value={category} />
            ) : null}
            {offer ? <input type="hidden" name="offer" value={offer} /> : null}

            <div className="catalog__filter-group">
              <p className="catalog__filter-label">قلمرو</p>
              <ul className="catalog__filter-list">
                <li>
                  <Link
                    href={buildHref({ category: "", page: "1" })}
                    className={
                      "catalog__filter-chip" +
                      (!category ? " catalog__filter-chip--active" : "")
                    }
                  >
                    همه ({categories.reduce((n, c) => n + c.courseCount, 0)})
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={buildHref({ category: cat.slug, page: "1" })}
                      className={
                        "catalog__filter-chip" +
                        (category === cat.slug
                          ? " catalog__filter-chip--active"
                          : "")
                      }
                    >
                      {cat.title} ({cat.courseCount})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="catalog__filter-group">
              <p className="catalog__filter-label">وضعیت</p>
              <ul className="catalog__filter-list">
                {OFFER_FILTERS.map((item) => (
                  <li key={item.value || "all"}>
                    <Link
                      href={buildHref({ offer: item.value, page: "1" })}
                      className={
                        "catalog__filter-chip" +
                        ((offer ?? "") === item.value
                          ? " catalog__filter-chip--active"
                          : "")
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <button type="submit" className="catalog__search-submit">
              اعمال جستجو
            </button>
          </form>
        </aside>

        <section className="catalog__results" aria-live="polite">
          <p className="catalog__count">
            {result.total.toLocaleString("fa-IR")} دوره
            {q ? ` برای «${q}»` : ""}
          </p>

          {result.items.length === 0 ? (
            <p className="catalog__empty">
              دوره‌ای با این فیلترها یافت نشد. فیلتر را تغییر دهید یا بعداً
              دوباره سر بزنید.
            </p>
          ) : (
            <div className="catalog__grid">
              {result.items.map((course) => (
                <CourseCardLink key={course.id} course={course} />
              ))}
            </div>
          )}

          {result.totalPages > 1 ? (
            <nav className="catalog__pagination" aria-label="صفحه‌بندی">
              {page > 1 ? (
                <Link href={buildHref({ page: String(page - 1) })}>قبلی</Link>
              ) : (
                <span className="catalog__page-disabled">قبلی</span>
              )}
              <span>
                صفحه {page.toLocaleString("fa-IR")} از{" "}
                {result.totalPages.toLocaleString("fa-IR")}
              </span>
              {page < result.totalPages ? (
                <Link href={buildHref({ page: String(page + 1) })}>بعدی</Link>
              ) : (
                <span className="catalog__page-disabled">بعدی</span>
              )}
            </nav>
          ) : null}
        </section>
      </div>
    </div>
  );
}
