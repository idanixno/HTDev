import Link from "next/link";
import { Button } from "@zharfa/ui";
import {
  DisinabBadge,
  DisinabFacts,
  DisinabPlate,
} from "../../../../components/disinab";
import { PaymentLicense } from "../../../../components/payment-license";
import {
  fetchMyOrder,
  orderStatusLabel,
  providerLabel,
} from "../../../../lib/commerce";
import { fetchCurrentUser } from "../../../../lib/session";
import { fetchMySpotAccess } from "../../../../lib/spotplayer";
import { SHOW_TRACK_STACK } from "../../../../lib/track-display";

type Search = Promise<{ orderId?: string }>;

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { orderId } = await searchParams;
  const user = await fetchCurrentUser();
  const [order, access] = await Promise.all([
    user && orderId ? fetchMyOrder(orderId) : Promise.resolve(null),
    user ? fetchMySpotAccess() : Promise.resolve(null),
  ]);
  const reallyPaid = order?.status === "PAID";

  const licenses = access?.items ?? [];
  const license =
    order == null
      ? null
      : licenses.find((lic) => lic.orderId === order.id) ??
        licenses.find((lic) => lic.courseId === order.course.id) ??
        licenses.find((lic) => lic.course?.slug === order.course.slug) ??
        null;
  const licenseKey =
    license?.status === "SUCCEEDED" ? license.licenseKey : null;
  const licensePending =
    reallyPaid &&
    Boolean(license) &&
    license?.status !== "SUCCEEDED" &&
    !licenseKey;

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
          label: "دوره",
          value: <Link href={order.course.href}>{order.course.title}</Link>,
        },
        {
          label: "وضعیت",
          value: (
            <span
              className="disinab-payment__status"
              data-tone={reallyPaid ? "success" : "pending"}
            >
              <span className="disinab-payment__status-dot" aria-hidden="true" />
              <strong>{orderStatusLabel(order.status)}</strong>
            </span>
          ),
        },
        {
          label: "درگاه",
          value: providerLabel(order.paymentProvider),
        },
        {
          label: "مبلغ",
          value: order.amountLabel,
        },
        ...(order.latestTransaction?.gatewayRefId
          ? [
              {
                label: "کد پیگیری",
                value: (
                  <code className="disinab-payment__ref" dir="ltr">
                    {order.latestTransaction.gatewayRefId}
                  </code>
                ),
              },
            ]
          : []),
      ]
    : [];

  return (
    <div className="disinab-payment">
      <DisinabPlate
        className="disinab-payment__plate"
        aria-labelledby="success-heading"
      >
        <div className="disinab-payment__head">
          <DisinabBadge tone={reallyPaid ? "live" : "muted"}>
            {reallyPaid ? "تأیید شد" : "در انتظار تأیید"}
          </DisinabBadge>
        </div>
        <h1 id="success-heading">
          {reallyPaid ? "پرداخت تأیید شد" : "وضعیت پرداخت را بررسی کنید"}
        </h1>
        <p className="disinab__line">
          {reallyPaid
            ? "سفارش ثبت شد؛ دسترسی دوره از حساب شما فعال می‌شود."
            : "پرداخت هنوز تأیید نشده. کمی بعد دوباره وضعیت را ببینید."}
        </p>

        {order ? (
          <DisinabFacts items={factItems} />
        ) : (
          <p className="disinab__line disinab-payment__empty">
            سفارش یافت نشد. وارد شوید یا از تاریخچه سفارش‌ها باز کنید.
          </p>
        )}

        {reallyPaid ? (
          <PaymentLicense
            licenseKey={licenseKey}
            pending={licensePending || (!license && reallyPaid)}
          />
        ) : null}

        <div className="disinab-payment__actions">
          <Button href="/dashboard">حساب من</Button>
          {SHOW_TRACK_STACK ? (
            <Button href="/dashboard/tracks" variant="secondary">
              تخصص‌ها
            </Button>
          ) : null}
          <p className="disinab-payment__more">
            <Link href="/dashboard#folio-courses">دوره‌های من</Link>
          </p>
        </div>
      </DisinabPlate>
    </div>
  );
}
