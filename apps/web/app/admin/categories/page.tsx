import { Notice } from "@zharfa/ui";
import { fetchAdminCategories } from "../../../lib/admin";

export default async function AdminCategoriesPage() {
  const data = await fetchAdminCategories();

  return (
    <section className="admin-page" aria-labelledby="admin-cats-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">کاتالوگ</p>
          <h1 id="admin-cats-heading" className="admin-page__title">
            دسته‌بندی‌ها
          </h1>
          <p className="admin-page__subtitle">ساختار موضوعی دوره‌ها.</p>
        </div>
      </header>

      {!data ? (
        <Notice tone="error" title="خطا">دریافت دسته‌ها ممکن نشد.</Notice>
      ) : data.length === 0 ? (
        <Notice tone="information" title="خالی">دسته‌ای ثبت نشده.</Notice>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>عنوان</th>
                <th>اسلاگ</th>
                <th>ترتیب</th>
                <th>تعداد دوره</th>
                <th>خلاصه</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}>
                  <td className="admin-table__primary">{c.title}</td>
                  <td className="admin-table__muted">{c.slug}</td>
                  <td>{c.sortOrder}</td>
                  <td>{c.courseCount.toLocaleString("fa-IR")}</td>
                  <td>{c.summary ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
