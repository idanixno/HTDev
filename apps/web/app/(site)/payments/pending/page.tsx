import Link from "next/link";
import { Notice } from "@zharfa/ui";
import { PendingRedirect } from "../../../../components/pending-redirect";
import { fetchMyOrder, orderStatusLabel } from "../../../../lib/commerce";
import { safeGatewayRedirectUrl } from "../../../../lib/safe-path";
import { fetchCurrentUser } from "../../../../lib/session";

type Search = Promise<{ orderId?: string; next?: string }>;

export default async function PaymentPendingPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { orderId, next: nextRaw } = await searchParams;
  const next = safeGatewayRedirectUrl(nextRaw);
  const user = await fetchCurrentUser();
  const order =
    user && orderId ? await fetchMyOrder(orderId) : null;

  return (
    <section className="payment-result" aria-labelledby="pending-heading">
      <p className="payment-result__eyebrow">پرداخت</p>
      <h1 id="pending-heading" className="payment-result__title">
        در انتظار پرداخت
      </h1>
      <p className="payment-result__subtitle">
        سفارش هنوز پرداخت‌شده نیست. تا تأیید درگاه، دسترسی فعال نمی‌شود.
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
        </dl>
      ) : null}

      <Notice tone="information" title="وضعیت صادقانه">
        این صفحه به‌معنای موفقیت نیست. اگر به درگاه نروید یا پرداخت را لغو کنید،
        سفارش در انتظار یا ناموفق می‌ماند.
      </Notice>

      {next ? <PendingRedirect nextUrl={next} /> : null}

      <p className="payment-result__links">
        <Link href="/dashboard">حساب من</Link>
        {" · "}
        <Link href="/dashboard">حساب من</Link>
      </p>
    </section>
  );
}
