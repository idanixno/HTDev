import { Notice } from "@zharfa/ui";
import { fetchAdminActivity, formatDateFa } from "../../../lib/admin";

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const data = await fetchAdminActivity(sp.q);

  return (
    <section className="admin-page" aria-labelledby="admin-activity-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">امنیت</p>
          <h1 id="admin-activity-heading" className="admin-page__title">
            گزارش فعالیت
          </h1>
          <p className="admin-page__subtitle">
            ردپای اقدامات ادمین — بدون سکرت در metadata.
          </p>
        </div>
        <form className="admin-search" method="get">
          <input
            type="search"
            name="q"
            placeholder="جستجو در خلاصه یا action…"
            defaultValue={sp.q ?? ""}
          />
          <button type="submit">جستجو</button>
        </form>
      </header>

      {!data ? (
        <Notice tone="error" title="خطا">
          دریافت لاگ ممکن نشد.
        </Notice>
      ) : data.items.length === 0 ? (
        <Notice tone="information" title="خالی">
          هنوز رویدادی ثبت نشده.
        </Notice>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>زمان</th>
                <th>اقدام</th>
                <th>خلاصه</th>
                <th>بازیگر</th>
                <th>موجودیت</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((row) => (
                <tr key={row.id}>
                  <td>{formatDateFa(row.createdAt)}</td>
                  <td>
                    <code>{row.action}</code>
                  </td>
                  <td>{row.summary}</td>
                  <td>{row.actor?.displayName ?? "سیستم"}</td>
                  <td className="admin-table__muted">
                    {row.entityType}
                    {row.entityId ? ` · ${row.entityId.slice(0, 10)}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="admin-page__hint">
            {data.total.toLocaleString("fa-IR")} رویداد
          </p>
        </div>
      )}
    </section>
  );
}
