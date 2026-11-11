import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, Button, Notice } from "@zharfa/ui";
import {
  DisinabBadge,
  DisinabPlate,
  DisinabStatus,
} from "../../../components/disinab";
import { TrackOverviewCards } from "../../../components/course-track-timeline";
import { IdCard } from "../../../components/id-card";
import { LicenseKey } from "../../../components/license-key";
import { ownedCourseSlugs } from "../../../lib/enrollment";
import { fetchMyRelevantTracks } from "../../../lib/my-tracks";
import { fetchNotifications } from "../../../lib/notifications";
import { fetchCurrentUser } from "../../../lib/session";
import { SHOW_TRACK_STACK } from "../../../lib/track-display";
import {
  fetchMySpotAccess,
  licenseStatusLabel,
  type SpotPlayerLicenseStatus,
} from "../../../lib/spotplayer";
import {
  fetchMyTickets,
  ticketStatusBadge,
  ticketStatusLabel,
} from "../../../lib/tickets";

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

  const [access, tickets, notifications, owned] = await Promise.all([
    fetchMySpotAccess(),
    fetchMyTickets(),
    fetchNotifications(),
    ownedCourseSlugs(),
  ]);
  const licenses = access?.items ?? [];
  const tracks = SHOW_TRACK_STACK
    ? await fetchMyRelevantTracks(owned)
    : [];
  const playerUrl = access?.instructions?.siteUrl ?? "https://spotplayer.ir/";

  return (
    <div className="folio salon-main disinab-folio">
      <div className="disinab-folio__identity">
        <IdCard user={user} notifications={notifications} />
      </div>

      <div className="disinab-folio__rail">
        {SHOW_TRACK_STACK ? (
          <DisinabPlate
            className="disinab-folio__panel"
            aria-labelledby="folio-tracks"
          >
            <header className="disinab-folio__head disinab-folio__head--split">
              <div>
                <h2 id="folio-tracks">تخصص‌های من</h2>
                <p className="disinab__line">
                  فقط بر اساس دوره‌هایی که واقعاً در حسابتان فعال است.
                </p>
              </div>
              <Link className="z-btn z-btn--secondary" href="/dashboard/tracks">
                جزئیات تخصص‌ها
              </Link>
            </header>
            {tracks.length === 0 ? (
              <Notice tone="information" title="تخصصی فعال نیست">
                بعد از خرید یا دریافت یک دوره، مسیر مرتبط اینجا می‌آید.{" "}
                <Link href="/courses">مرور دوره‌ها</Link>
              </Notice>
            ) : (
              <TrackOverviewCards tracks={tracks} ownedSlugs={owned} />
            )}
          </DisinabPlate>
        ) : null}

        <DisinabPlate
          className="disinab-folio__panel"
          aria-labelledby="folio-courses"
        >
          <header className="disinab-folio__head">
            <h2 id="folio-courses">دوره‌ها</h2>
            <p className="disinab__line">
              لایسنس‌ها و وضعیت دسترسی دوره‌های شما در یک صفحه.
            </p>
          </header>
          {licenses.length === 0 ? (
            <Notice tone="information" title="هنوز دوره‌ای در حساب نیست">
              پس از خرید تأییدشده، دوره اینجا دیده می‌شود.{" "}
              <Link href="/courses">مرور دوره‌ها</Link>
            </Notice>
          ) : (
            <div className="access-list access-list--rows disinab-folio__rows-list">
              {licenses.map((lic) => {
                const title = lic.course?.title ?? lic.courseId;
                const href = lic.course?.slug
                  ? `/courses/${lic.course.slug}`
                  : null;
                return (
                  <article
                    key={lic.id}
                    className={
                      "access-card disinab-folio__card disinab-folio__card--row" +
                      (lic.course?.coverAsset ? "" : " is-plain")
                    }
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
                    <div className="access-card__body">
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
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </DisinabPlate>

        <DisinabPlate
          className="disinab-folio__panel"
          aria-labelledby="folio-player"
        >
          <header className="disinab-folio__head">
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
              <h2 id="folio-support">پشتیبانی</h2>
              <p className="disinab__line">
                سیستم تیکت اختصاصی{" "}
                <span className="dx-wordmark dx-wordmark--inline">DXCode</span>{" "}
                برای پیگیری گفتگو با تیم.
              </p>
            </div>
            <div className="disinab-folio__support-actions">
              <Button href="/dashboard/tickets/new">تیکت جدید</Button>
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
