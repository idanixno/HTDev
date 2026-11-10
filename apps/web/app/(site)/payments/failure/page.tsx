import Link from "next/link";
import { Button } from "@zharfa/ui";
import {
  DisinabBadge,
  DisinabFacts,
  DisinabPlate,
} from "../../../../components/disinab";
import {
  fetchMyOrder,
  orderStatusLabel,
} from "../../../../lib/commerce";
import { fetchCurrentUser } from "../../../../lib/session";

type Search = Promise<{ orderId?: string }>;

export default async function PaymentFailurePage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { orderId } = await searchParams;
  const user = await fetchCurrentUser();
  const order = user && orderId ? await fetchMyOrder(orderId) : null;

  const factItems = order
    ? [
        {
          label: "سفارش",
          value: (
            <code className="disinab-payment__ref" dir="ltr">
              {order.id}
            </code>
          ),
          hint: true,
        },
        {
          label: "وضعیت",
          value: (
            <span className="disinab-payment__status" data-tone="pending">
              <span className="disinab-payment__status-dot" aria-hidden="true" />
              <strong>{orderStatusLabel(order.status)}</strong>
            </span>
          ),
        },
        {
          label: "مبلغ",
          value: order.amountLabel,
        },
      ]
    : [];

  return (
    <div className="disinab-payment">
      <DisinabPlate
        className="disinab-payment__plate"
        aria-labelledby="failure-heading"
      >
        <div className="disinab-payment__head">
          <p className="disinab__brand">ژرفا · پرداخت</p>
          <DisinabBadge tone="muted">ناموفق</DisinabBadge>
        </div>
        <h1 id="failure-heading">پرداخت ناموفق یا لغو شد</h1>
        <p className="disinab__line">
          سفارش پرداخت نشده و دسترسی دوره فعال نیست.
        </p>

        {order ? <DisinabFacts items={factItems} /> : null}

        <div className="disinab-payment__actions">
          {order?.course ? (
            <Button href={`/courses/${order.course.slug}/purchase`}>
              تلاش دوباره
            </Button>
          ) : null}
          <Button href="/dashboard" variant="secondary">
            حساب من
          </Button>
          <p className="disinab-payment__more">
            <Link href="/courses">بازگشت به کاتالوگ</Link>
          </p>
        </div>
      </DisinabPlate>
    </div>
  );
}
