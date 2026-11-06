import { Badge, Notice } from "@zharfa/ui";
import { fetchAdminCustomers, formatDateFa } from "../../../lib/admin";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const data = await fetchAdminCustomers(sp.q);

  return (
    <section className="admin-page" aria-labelledby="admin-customers-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">کاربران</p>
          <h1 id="admin-customers-heading" className="admin-page__title">
            مشتریان
          </h1>
          <p className="admin-page__subtitle">
            دانشجویان و مالک — نقش از پایگاه‌داده (OwnerGuard).
          </p>
        </div>
        <form className="admin-search" method="get">
          <input
            type="search"
            name="q"
            placeholder="نام، ایمیل، موبایل…"
            defaultValue={sp.q ?? ""}
          />
          <button type="submit">جستجو</button>
        </form>
      </header>

      {!data ? (
        <Notice tone="error" title="خطا">دریافت کاربران ممکن نشد.</Notice>
      ) : data.items.length === 0 ? (
        <Notice tone="information" title="خالی">کاربری یافت نشد.</Notice>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>نام</th>
                <th>نقش</th>
                <th>ایمیل</th>
                <th>سفارش</th>
                <th>تیکت</th>
                <th>ثبت‌نام</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="admin-table__primary">{u.displayName}</div>
                    <div className="admin-table__muted">@{u.username}</div>
                  </td>
                  <td>
                    <Badge status={u.role === "OWNER" ? "success" : "information"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.orderCount.toLocaleString("fa-IR")}</td>
                  <td>{u.ticketCount.toLocaleString("fa-IR")}</td>
                  <td>{formatDateFa(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
