import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Notice } from "@zharfa/ui";
import { OrderActionsForm } from "../../../../components/admin/order-actions-form";
import { fetchAdminOrder, formatDateFa } from "../../../../lib/admin";
import { orderStatusLabel, providerLabel } from "../../../../lib/commerce-shared";
import { licenseStatusLabel } from "../../../../lib/spotplayer-shared";

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
  status: string,
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

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const order = await fetchAdminOrder(id);
  if (!order) notFound();

  const primaryLicense = order.licenses[0] ?? null;
  const canRetryLicense =
    order.status === "PAID" &&
    (!primaryLicense ||
      primaryLicense.status === "FAILED" ||
      primaryLicense.status === "PENDING" ||
      primaryLicense.status === "QUEUED" ||
      primaryLicense.status === "IN_PROGRESS" ||
      (primaryLicense.status === "SUCCEEDED" && !primaryLicense.licenseKey));

  return (
    <section className="admin-page" aria-labelledby="admin-order-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">
            <Link href="/admin/orders">سفارش‌ها</Link>
          </p>
          <h1 id="admin-order-heading" className="admin-page__title">
            جزئیات سفارش
          </h1>
          <p className="admin-page__subtitle">
            مشاهده، تغییر وضعیت، و تأیید صدور لایسنس اسپات‌پلیر.
          </p>
        </div>
      </header>

      <div className="admin-split">
        <article className="admin-panel">
          <h2>سفارش</h2>
          <dl className="admin-dl">
            <div>
              <dt>شناسه</dt>
              <dd>
                <code>{order.id}</code>
              </dd>
            </div>
            <div>
              <dt>وضعیت</dt>
              <dd>
                <Badge status={orderBadgeTone(order.status)}>
                  {orderStatusLabel(order.status)}
                </Badge>
              </dd>
            </div>
            <div>
              <dt>مبلغ</dt>
              <dd>{order.amountLabel}</dd>
            </div>
            <div>
              <dt>درگاه</dt>
              <dd>{providerLabel(order.paymentProvider)}</dd>
            </div>
            <div>
              <dt>کد تخفیف</dt>
              <dd>{order.couponCode ?? "—"}</dd>
            </div>
            <div>
              <dt>پرداخت</dt>
              <dd>
                {order.paidAt ? formatDateFa(order.paidAt) : "هنوز پرداخت نشده"}
              </dd>
            </div>
            <div>
              <dt>ایجاد</dt>
              <dd>{formatDateFa(order.createdAt)}</dd>
            </div>
          </dl>
        </article>

        <article className="admin-panel">
          <h2>خریدار و دوره</h2>
          <dl className="admin-dl">
            <div>
              <dt>نام</dt>
              <dd>{order.user.displayName}</dd>
            </div>
            <div>
              <dt>ایمیل</dt>
              <dd>{order.user.email}</dd>
            </div>
            <div>
              <dt>نام کاربری</dt>
              <dd>{order.user.username}</dd>
            </div>
            <div>
              <dt>تلفن</dt>
              <dd>{order.user.phone ?? "—"}</dd>
            </div>
            <div>
              <dt>دوره</dt>
              <dd>
                <Link href={`/admin/courses/${order.course.id}`}>
                  {order.course.title}
                </Link>
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <article className="admin-panel" style={{ marginTop: "var(--zharfa-space-24)" }}>
        <h2>اقدامات</h2>
        <OrderActionsForm
          orderId={order.id}
          status={order.status}
          allowedNextStatuses={order.allowedNextStatuses}
          canRetryLicense={canRetryLicense}
        />
      </article>

      <article className="admin-panel" style={{ marginTop: "var(--zharfa-space-24)" }}>
        <h2>صدور لایسنس</h2>
        {order.licenses.length === 0 ? (
          <Notice tone="information" title="بدون رکورد صدور">
            هنوز لایسنسی برای این سفارش ثبت نشده. اگر پرداخت تأیید شده، از دکمه
            «تأیید / صدور مجدد لایسنس» استفاده کنید.
          </Notice>
        ) : (
          <ul className="admin-list">
            {order.licenses.map((lic) => (
              <li key={lic.id}>
                <Badge status={licenseBadgeTone(lic.status)}>
                  {lic.status === "SUCCEEDED"
                    ? "تاییدشده"
                    : licenseStatusLabel(
                        lic.status as
                          | "PENDING"
                          | "QUEUED"
                          | "IN_PROGRESS"
                          | "SUCCEEDED"
                          | "FAILED",
                      )}
                </Badge>{" "}
                · تلاش {lic.attemptCount.toLocaleString("fa-IR")}
                {lic.lastError ? ` · ${lic.lastError}` : ""}
                {lic.licenseKey ? (
                  <>
                    {" "}
                    · کلید: <code>{lic.licenseKey}</code>
                  </>
                ) : null}
                {lic.provisionedAt
                  ? ` · صادرشده ${formatDateFa(lic.provisionedAt)}`
                  : ""}
              </li>
            ))}
          </ul>
        )}
      </article>

      {order.payments.length > 0 ? (
        <article
          className="admin-panel"
          style={{ marginTop: "var(--zharfa-space-24)" }}
        >
          <h2>تراکنش‌های درگاه</h2>
          <ul className="admin-list">
            {order.payments.map((tx) => (
              <li key={tx.id}>
                {providerLabel(tx.provider)} · {tx.status} · {tx.amountLabel}
                {tx.gatewayRefId ? ` · ref ${tx.gatewayRefId}` : ""}
                {tx.failureReason ? ` · ${tx.failureReason}` : ""}
                {" · "}
                {formatDateFa(tx.verifiedAt ?? tx.createdAt)}
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}
