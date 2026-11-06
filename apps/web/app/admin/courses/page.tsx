import { Badge, Notice } from "@zharfa/ui";
import { fetchAdminCourses, formatDateFa } from "../../../lib/admin";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const data = await fetchAdminCourses(sp.q);

  return (
    <section className="admin-page" aria-labelledby="admin-courses-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">کاتالوگ</p>
          <h1 id="admin-courses-heading" className="admin-page__title">
            دوره‌ها
          </h1>
          <p className="admin-page__subtitle">
            فهرست کامل دوره‌ها با وضعیت انتشار و پیشنهاد تجاری.
          </p>
        </div>
        <form className="admin-search" method="get">
          <input
            type="search"
            name="q"
            placeholder="جستجو عنوان یا اسلاگ…"
            defaultValue={sp.q ?? ""}
          />
          <button type="submit">جستجو</button>
        </form>
      </header>

      {!data ? (
        <Notice tone="error" title="خطا">دریافت دوره‌ها ممکن نشد.</Notice>
      ) : data.items.length === 0 ? (
        <Notice tone="information" title="خالی">دوره‌ای یافت نشد.</Notice>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>عنوان</th>
                <th>انتشار</th>
                <th>پیشنهاد</th>
                <th>قیمت</th>
                <th>دسته</th>
                <th>سفارش</th>
                <th>به‌روز</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="admin-table__primary">{c.title}</div>
                    <div className="admin-table__muted">{c.slug}</div>
                  </td>
                  <td>
                    <Badge status="information">{c.publicationStatus}</Badge>
                  </td>
                  <td>{c.offerKind}</td>
                  <td>{c.priceLabel}</td>
                  <td>{c.category?.title ?? "—"}</td>
                  <td>{c.orderCount.toLocaleString("fa-IR")}</td>
                  <td>{formatDateFa(c.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="admin-page__hint">
            {data.total.toLocaleString("fa-IR")} دوره
          </p>
        </div>
      )}
    </section>
  );
}
