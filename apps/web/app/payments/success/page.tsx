import Link from "next/link";
import { Notice } from "@zharfa/ui";
import {
  fetchMyOrder,
  orderStatusLabel,
  providerLabel,
} from "../../../lib/commerce";
import { fetchCurrentUser } from "../../../lib/session";

type Search = Promise<{ orderId?: string }>;

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { orderId } = await searchParams;
  const user = await fetchCurrentUser();
  const order =
    user && orderId ? await fetchMyOrder(orderId) : null;

  const reallyPaid = order?.status === "PAID";

  return (
    <section className="payment-result" aria-labelledby="success-heading">
      <p className="payment-result__eyebrow">پرداخت</p>
      <h1 id="success-heading" className="payment-result__title">
        {reallyPaid ? "پرداخت تأیید شد" : "وضعیت پرداخت را بررسی کنید"}
      </h1>
      <p className="payment-result__subtitle">
        {reallyPaid
          ? "سفارش به‌عنوان پرداخت‌شده ثبت شد."
          : "پرداخت هنوز تأیید نشده است."}
      </p>

      {order ? (
        <dl className="payment-result__meta">
          <div>
            <dt>سفارش</dt>
            <dd>{order.id}</dd>
          </div>
          <div>
            <dt>دوره</dt>
            <dd>
              <Link href={order.course.href}>{order.course.title}</Link>
            </dd>
          </div>
          <div>
            <dt>وضعیت</dt>
            <dd>{orderStatusLabel(order.status)}</dd>
          </div>
          <div>
            <dt>درگاه</dt>
            <dd>{providerLabel(order.paymentProvider)}</dd>
          </div>
          <div>
            <dt>مبلغ</dt>
            <dd>{order.amountLabel}</dd>
          </div>
          {order.latestTransaction?.gatewayRefId ? (
            <div>
              <dt>کد پیگیری</dt>
              <dd>{order.latestTransaction.gatewayRefId}</dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <Notice tone="information" title="سفارش یافت نشد">
          برای دیدن جزئیات وارد شوید یا از تاریخچه سفارش‌ها باز کنید.
        </Notice>
      )}

      {!reallyPaid ? (
        <Notice tone="information" title="پرداخت هنوز تأیید نشده">
          دسترسی دوره بعد از تأیید پرداخت فعال می‌شود.
        </Notice>
      ) : (
        <Notice tone="success" title="پرداخت ثبت شد">
          وضعیت دوره را در{" "}
          <Link href="/dashboard#courses">حساب من</Link> ببینید.
        </Notice>
      )}

      <p className="payment-result__links">
        <Link href="/dashboard/orders">تاریخچه سفارش‌ها</Link>
        {" · "}
        <Link href="/dashboard/access">دسترسی اسپات‌پلیر</Link>
        {" · "}
        <Link href="/dashboard">حساب من</Link>
      </p>
    </section>
  );
}
