import Link from "next/link";
import { Notice } from "@zharfa/ui";
import {
  fetchMyOrder,
  orderStatusLabel,
} from "../../../lib/commerce";
import { fetchCurrentUser } from "../../../lib/session";

type Search = Promise<{ orderId?: string }>;

export default async function PaymentFailurePage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { orderId } = await searchParams;
  const user = await fetchCurrentUser();
  const order =
    user && orderId ? await fetchMyOrder(orderId) : null;

  return (
    <section className="payment-result" aria-labelledby="failure-heading">
      <p className="payment-result__eyebrow">پرداخت</p>
      <h1 id="failure-heading" className="payment-result__title">
        پرداخت ناموفق یا لغو شد
      </h1>
      <p className="payment-result__subtitle">
        سفارش پرداخت‌شده نیست و دسترسی دوره فعال نشده است.
      </p>

      {order ? (
        <dl className="payment-result__meta">
          <div>
            <dt>سفارش</dt>
            <dd>{order.id}</dd>
          </div>
          <div>
            <dt>وضعیت</dt>
            <dd>{orderStatusLabel(order.status)}</dd>
          </div>
          <div>
            <dt>مبلغ</dt>
            <dd>{order.amountLabel}</dd>
          </div>
          {order.latestTransaction?.failureReason ? (
            <div>
              <dt>دلیل</dt>
              <dd>{order.latestTransaction.failureReason}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <Notice tone="error" title="بدون دسترسی ساختگی">
        حتی اگر صفحهٔ بانک چیزی نشان داده باشد، تا verify سرور موفق نشود، وضعیت
        PAID ثبت نمی‌شود.
      </Notice>

      <p className="payment-result__links">
        {order?.course ? (
          <>
            <Link href={`/courses/${order.course.slug}/purchase`}>
              تلاش دوباره
            </Link>
            {" · "}
          </>
        ) : null}
        <Link href="/dashboard/orders">تاریخچه سفارش‌ها</Link>
        {" · "}
        <Link href="/courses">کاتالوگ</Link>
      </p>
    </section>
  );
}
