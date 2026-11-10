import Link from "next/link";
import { Badge, Notice } from "@zharfa/ui";
import { fetchAdminOrders, formatDateFa } from "../../../lib/admin";
import { orderStatusLabel, providerLabel } from "../../../lib/commerce-shared";
import { licenseStatusLabel } from "../../../lib/spotplayer-shared";

const STATUSES = [
  { label: "همه" },
  { label: orderStatusLabel("PAID"), status: "PAID" },
  { label: orderStatusLabel("PENDING"), status: "PENDING" },
  { label: orderStatusLabel("AWAITING_GATEWAY"), status: "AWAITING_GATEWAY" },
  { label: orderStatusLabel("FAILED"), status: "FAILED" },
  { label: orderStatusLabel("REFUNDED"), status: "REFUNDED" },
  { label: orderStatusLabel("CANCELED"), status: "CANCELED" },
] as const;

const LICENSE_FILTERS = [
  { label: "همهٔ صدور" },
  { label: "در صف", licenseStatus: "QUEUED" },
  { label: "در حال صدور", licenseStatus: "IN_PROGRESS" },
  { label: "تاییدشده", licenseStatus: "SUCCEEDED" },
  { label: "در انتظار صدور", licenseStatus: "PENDING" },
  { label: "صدور ناموفق", licenseStatus: "FAILED" },
] as const;

function orderBadgeTone(
  status: string,
): "success" | "pending" | "failure" | "information" {
  switch (status) {
    case "PAID":
      return "success";
    case "FAILED":
    case "CANCELED":
      return "failure";
    case "PENDING":
    case "AWAITING_GATEWAY":
    case "REFUNDED":
      return "pending";
    default:
      return "information";
  }
}

function licenseBadgeTone(
  status: string | null | undefined,
): "success" | "pending" | "failure" | "information" {
  switch (status) {
    case "SUCCEEDED":
      return "success";
    case "FAILED":
      return "failure";
    case "QUEUED":
    case "IN_PROGRESS":
    case "PENDING":
      return "pending";
    default:
      return "information";
  }
}

function ordersHref(parts: {
  status?: string;
  licenseStatus?: string;
  q?: string;
}) {
  const qs = new URLSearchParams();
  if (parts.status) qs.set("status", parts.status);
  if (parts.licenseStatus) qs.set("licenseStatus", parts.licenseStatus);
  if (parts.q) qs.set("q", parts.q);
  const suffix = qs.toString();
  return suffix ? `/admin/orders?${suffix}` : "/admin/orders";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    licenseStatus?: string;
    q?: string;
  }>;
}) {
  const sp = await searchParams;
  const data = await fetchAdminOrders({
    status: sp.status,
    licenseStatus: sp.licenseStatus,
    q: sp.q,
  });

  return (
    <section className="admin-page" aria-labelledby="admin-orders-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">تجارت</p>
          <h1 id="admin-orders-heading" className="admin-page__title">
            سفارش‌ها
          </h1>
          <p className="admin-page__subtitle">
            وضعیت واقعی سفارش‌ها از درگاه — و صف صدور لایسنس اسپات‌پلیر بعد از
            پرداخت.
          </p>
        </div>
        <form className="admin-search" method="get">
          {sp.status ? (
            <input type="hidden" name="status" value={sp.status} />
          ) : null}
          {sp.licenseStatus ? (
            <input
              type="hidden"
              name="licenseStatus"
              value={sp.licenseStatus}
            />
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

      <nav className="admin-filters" aria-label="فیلتر وضعیت سفارش">
        {STATUSES.map((f) => {
          const status = "status" in f ? f.status : undefined;
          const href = ordersHref({
            status,
            licenseStatus: sp.licenseStatus,
            q: sp.q,
          });
          const current =
            (!sp.status && !status) || sp.status === status;
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

      <nav className="admin-filters" aria-label="فیلتر صدور لایسنس">
        {LICENSE_FILTERS.map((f) => {
          const licenseStatus =
            "licenseStatus" in f ? f.licenseStatus : undefined;
          const href = ordersHref({
            status: sp.status,
            licenseStatus,
            q: sp.q,
          });
          const current =
            (!sp.licenseStatus && !licenseStatus) ||
            sp.licenseStatus === licenseStatus;
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
        <Notice tone="error" title="خطا">
          دریافت سفارش‌ها ممکن نشد.
        </Notice>
      ) : data.items.length === 0 ? (
        <Notice tone="information" title="خالی">
          سفارشی یافت نشد.
          {sp.licenseStatus ? (
            <>
              {" "}
              برای صف کامل صدور به{" "}
              <Link href="/admin/spotplayer">اسپات‌پلیر</Link> هم سر بزنید.
            </>
          ) : null}
        </Notice>
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
                <th>صدور</th>
                <th>درگاه</th>
                <th>تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="admin-table__primary"
                    >
                      {o.id.slice(0, 12)}…
                    </Link>
                  </td>
                  <td>
                    <div className="admin-table__primary">
                      {o.user.displayName}
                    </div>
                    <div className="admin-table__muted">{o.user.email}</div>
                  </td>
                  <td>{o.course.title}</td>
                  <td>{o.amountLabel}</td>
                  <td>
                    <Badge status={orderBadgeTone(o.status)}>
                      {orderStatusLabel(o.status)}
                    </Badge>
                  </td>
                  <td>
                    {o.license ? (
                      <Badge status={licenseBadgeTone(o.license.status)}>
                        {o.license.status === "SUCCEEDED"
                          ? "تاییدشده"
                          : licenseStatusLabel(
                              o.license.status as
                                | "PENDING"
                                | "QUEUED"
                                | "IN_PROGRESS"
                                | "SUCCEEDED"
                                | "FAILED",
                            )}
                      </Badge>
                    ) : (
                      <span className="admin-table__muted">—</span>
                    )}
                  </td>
                  <td>{providerLabel(o.paymentProvider)}</td>
                  <td>
                    <Link href={`/admin/orders/${o.id}`}>
                      {formatDateFa(o.paidAt ?? o.createdAt)}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="admin-page__hint">
            {data.total.toLocaleString("fa-IR")} سفارش · صدور لایسنس جدا از
            وضعیت درگاه است.
          </p>
        </div>
      )}
    </section>
  );
}
