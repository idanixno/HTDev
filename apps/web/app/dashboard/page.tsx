import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, Button, Notice } from "@zharfa/ui";
import {
  DisinabBadge,
  DisinabPlate,
  DisinabStatus,
} from "../../components/disinab";
import { IdCard } from "../../components/id-card";
import { LicenseKey } from "../../components/license-key";
import {
  fetchMyOrders,
  orderStatusLabel,
  providerLabel,
} from "../../lib/commerce";
import { SAMPLE_LICENSES } from "../../lib/sample-licenses";
import { fetchCurrentUser } from "../../lib/session";
import {
  fetchMySpotAccess,
  licenseStatusLabel,
  type SpotPlayerLicenseStatus,
} from "../../lib/spotplayer";
import {
  fetchMyTickets,
  ticketStatusBadge,
  ticketStatusLabel,
} from "../../lib/tickets";

function statusBadge(
  status: SpotPlayerLicenseStatus,
): "success" | "pending" | "failure" | "information" {
  switch (status) {
    case "SUCCEEDED":
      return "success";
    case "FAILED":
    case "IN_PROGRESS":
    case "QUEUED":
      return "pending";
    default:
      return "information";
  }
}

export default async function DashboardPage() {
  const user = await fetchCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const [orders, access, tickets] = await Promise.all([
    fetchMyOrders(),
    fetchMySpotAccess(),
    fetchMyTickets(),
  ]);
  const licenses = access?.items ?? [];
  const shownLicenses =
    licenses.length > 0
      ? licenses
      : process.env.NODE_ENV === "development"
        ? SAMPLE_LICENSES
        : [];
  const playerUrl = access?.instructions?.siteUrl ?? "https://spotplayer.ir/";

  return (
    <div className="folio salon-main disinab-folio">
      <div className="disinab-folio__identity">
        <IdCard user={user} />
      </div>

      <div className="disinab-folio__rail">
        <DisinabPlate
          className="disinab-folio__panel"
          aria-labelledby="folio-courses"
        >
          <header className="disinab-folio__head">
            <p className="disinab__brand">دسترسی</p>
            <h2 id="folio-courses">دوره‌ها</h2>
            <p className="disinab__line">
              لایسنس‌ها و وضعیت دسترسی دوره‌های شما در یک صفحه.
            </p>
          </header>
          {shownLicenses.length === 0 ? (
            <Notice tone="information" title="هنوز دوره‌ای در حساب نیست">
              پس از خرید تأییدشده، دوره اینجا دیده می‌شود.{" "}
              <Link href="/courses">مرور دوره‌ها</Link>
            </Notice>
          ) : (
            <div className="access-list access-list--grid disinab-folio__grid">
              {shownLicenses.map((lic) => {
                const title = lic.course?.title ?? lic.courseId;
                const href = lic.course?.slug
                  ? `/courses/${lic.course.slug}`
                  : null;
                return (
                  <article
                    key={lic.id}
                    className="access-card disinab-folio__card"
                  >
                    {lic.course?.coverAsset ? (
                      href ? (
                        <Link href={href} className="access-card__cover">
                          <img src={lic.course.coverAsset} alt="" />
                        </Link>
                      ) : (
                        <div className="access-card__cover">
                          <img src={lic.course.coverAsset} alt="" />
                        </div>
                      )
                    ) : null}
                    <div className="access-card__head">
                      <h3>
                        {href ? <Link href={href}>{title}</Link> : title}
                      </h3>
                      {lic.status !== "SUCCEEDED" ? (
                        <Badge status={statusBadge(lic.status)}>
                          {lic.status === "FAILED"
                            ? "در حال آماده‌سازی"
                            : licenseStatusLabel(lic.status)}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="access-card__meta">
                      {lic.accessSource === "FREE_COURSE"
                        ? "دوره رایگان"
                        : "سفارش پرداخت‌شده"}
                    </p>
                    {lic.status === "SUCCEEDED" && lic.licenseKey ? (
                      <LicenseKey id={lic.id} value={lic.licenseKey} />
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </DisinabPlate>

        <DisinabPlate
          className="disinab-folio__panel"
          aria-labelledby="folio-orders"
        >
          <header className="disinab-folio__head">
            <p className="disinab__brand">پرداخت</p>
            <h2 id="folio-orders">تراکنش‌ها</h2>
            <p className="disinab__line">
              تاریخچهٔ سفارش‌ها و وضعیت درگاه‌های پرداخت.
            </p>
          </header>
          {orders.length === 0 ? (
            <Notice tone="information" title="تراکنشی نیست">
              هنوز تراکنشی ثبت نشده. از <Link href="/courses">کاتالوگ</Link> یک
              دوره پولی انتخاب کنید.
            </Notice>
          ) : (
            <ul className="orders__list disinab-folio__rows">
              {orders.map((order) => (
                <li key={order.id} className="orders__item disinab-folio__row">
                  <div>
                    <h3>
                      <Link href={order.course.href}>{order.course.title}</Link>
                    </h3>
                    <p className="orders__meta">
                      {order.amountLabel} · {orderStatusLabel(order.status)} ·{" "}
                      {providerLabel(order.paymentProvider)} ·{" "}
                      {new Date(order.createdAt).toLocaleString("fa-IR")}
                    </p>
                  </div>
                  <Link
                    className="disinab-folio__link"
                    href={
                      order.status === "PAID"
                        ? `/payments/success?orderId=${order.id}`
                        : order.status === "FAILED" ||
                            order.status === "CANCELED"
                          ? `/payments/failure?orderId=${order.id}`
                          : `/payments/pending?orderId=${order.id}`
                    }
                  >
                    جزئیات
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DisinabPlate>

        <DisinabPlate
          className="disinab-folio__panel"
          aria-labelledby="folio-player"
        >
          <header className="disinab-folio__head">
            <p className="disinab__brand">پخش</p>
            <h2 id="folio-player">دانلود اسپات‌پلیر</h2>
            <p className="disinab__line">
              برای مشاهدهٔ ویدیوهای دارای لایسنس، اسپات‌پلیر را نصب کنید.
            </p>
          </header>
          <div className="disinab-folio__player">
            <DisinabBadge tone="live">آمادهٔ دانلود</DisinabBadge>
            <a
              className="folio-download disinab-folio__download"
              href={playerUrl}
              target="_blank"
              rel="noreferrer"
            >
              دانلود اسپات‌پلیر
            </a>
            <DisinabStatus host="spotplayer.ir" />
          </div>
        </DisinabPlate>

        <DisinabPlate
          className="disinab-folio__panel"
          aria-labelledby="folio-support"
        >
          <header className="disinab-folio__head disinab-folio__head--split">
            <div>
              <p className="disinab__brand">ارتباط</p>
              <h2 id="folio-support">پشتیبانی</h2>
              <p className="disinab__line">
                سیستم تیکت اختصاصی ژرفا برای پیگیری گفتگو با تیم.
              </p>
            </div>
            <div className="disinab-folio__support-actions">
              <Button href="/dashboard/tickets/new">تیکت جدید</Button>
              <Link className="disinab-folio__link" href="/dashboard/tickets">
                همه تیکت‌ها
              </Link>
            </div>
          </header>
          {tickets.length === 0 ? (
            <Notice tone="information" title="تیکتی نیست">
              هنوز گفتگویی باز نشده است.
            </Notice>
          ) : (
            <ul className="ticket-list disinab-folio__rows">
              {tickets.slice(0, 4).map((ticket) => (
                <li
                  key={ticket.id}
                  className="ticket-list__item disinab-folio__row"
                >
                  <div>
                    <h3>
                      <Link href={`/dashboard/tickets/${ticket.id}`}>
                        {ticket.subject}
                      </Link>
                    </h3>
                    <p className="ticket-list__meta">
                      {ticket.course ? `${ticket.course.title} · ` : null}
                      {new Date(ticket.updatedAt).toLocaleString("fa-IR")}
                    </p>
                  </div>
                  <Badge status={ticketStatusBadge(ticket.status)}>
                    {ticketStatusLabel(ticket.status)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </DisinabPlate>
      </div>
    </div>
  );
}
