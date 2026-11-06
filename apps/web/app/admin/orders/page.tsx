import Link from "next/link";
import { Badge, Notice } from "@zharfa/ui";
import { fetchAdminOrders, formatDateFa } from "../../../lib/admin";

const STATUSES = [
  { label: "همه" },
  { label: "PAID", status: "PAID" },
  { label: "PENDING", status: "PENDING" },
  { label: "AWAITING_GATEWAY", status: "AWAITING_GATEWAY" },
  { label: "FAILED", status: "FAILED" },
  { label: "REFUNDED", status: "REFUNDED" },
  { label: "CANCELED", status: "CANCELED" },
] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const data = await fetchAdminOrders({ status: sp.status, q: sp.q });

  return (
    <section className="admin-page" aria-labelledby="admin-orders-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">تجارت</p>
          <h1 id="admin-orders-heading" className="admin-page__title">
            سفارش‌ها
          </h1>
          <p className="admin-page__subtitle">
            وضعیت واقعی سفارش‌ها از درگاه — بدون PAID ساختگی در جریان پرداخت.
          </p>
        </div>
        <form className="admin-search" method="get">
          {sp.status ? (
            <input type="hidden" name="status" value={sp.status} />
          ) : null}
          <input
            type="search"
            name="q"
            placeholder="ایمیل، کاربر، دوره…"
            defaultValue={sp.q ?? ""}
          />
          <button type="submit">جستجو</button>
        </form>
      </header>

      <nav className="admin-filters" aria-label="فیلتر وضعیت">
        {STATUSES.map((f) => {
          const href =
            "status" in f && f.status
              ? `/admin/orders?status=${f.status}`
              : "/admin/orders";
          const current =
            (!sp.status && !("status" in f)) || sp.status === (f as { status?: string }).status;
          return (
            <Link
              key={f.label}
              href={href}
              className={
                "admin-filters__link" +
                (current ? " admin-filters__link--current" : "")
              }
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {!data ? (
        <Notice tone="error" title="خطا">دریافت سفارش‌ها ممکن نشد.</Notice>
      ) : data.items.length === 0 ? (
        <Notice tone="information" title="خالی">سفارشی یافت نشد.</Notice>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>شناسه</th>
                <th>کاربر</th>
                <th>دوره</th>
                <th>مبلغ</th>
                <th>وضعیت</th>
                <th>درگاه</th>
                <th>تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((o) => (
                <tr key={o.id}>
                  <td className="admin-table__muted">{o.id.slice(0, 12)}…</td>
                  <td>
                    <div className="admin-table__primary">
                      {o.user.displayName}
                    </div>
                    <div className="admin-table__muted">{o.user.email}</div>
                  </td>
                  <td>{o.course.title}</td>
                  <td>{o.amountLabel}</td>
                  <td>
                    <Badge
                      status={o.status === "PAID" ? "success" : "information"}
                    >
                      {o.status}
                    </Badge>
                  </td>
                  <td>{o.paymentProvider ?? "—"}</td>
                  <td>
                    {formatDateFa(o.paidAt ?? o.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="admin-page__hint">
            {data.total.toLocaleString("fa-IR")} سفارش
          </p>
        </div>
      )}
    </section>
  );
}
