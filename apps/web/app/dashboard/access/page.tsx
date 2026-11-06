import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, Notice } from "@zharfa/ui";
import { fetchCurrentUser } from "../../../lib/session";
import {
  fetchMySpotAccess,
  licenseStatusLabel,
  platformLabel,
  type SpotPlayerLicenseStatus,
} from "../../../lib/spotplayer";

function statusBadge(
  status: SpotPlayerLicenseStatus,
): "success" | "pending" | "failure" | "information" {
  switch (status) {
    case "SUCCEEDED":
      return "success";
    case "FAILED":
      return "failure";
    case "IN_PROGRESS":
    case "QUEUED":
      return "pending";
    default:
      return "information";
  }
}

export default async function AccessPage() {
  const user = await fetchCurrentUser();
  if (!user) redirect("/login?next=/dashboard/access");

  const access = await fetchMySpotAccess();
  const items = access?.items ?? [];
  const instructions = access?.instructions;

  return (
    <section className="dashboard" aria-labelledby="access-heading">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">دسترسی دوره</p>
          <h1 id="access-heading" className="dashboard__title">
            لایسنس اسپات‌پلیر
          </h1>
          <p className="dashboard__subtitle">
            وضعیت صدور لایسنس جدا از وضعیت پرداخت است. کلید فقط پس از پاسخ واقعی
            اسپات‌پلیر نمایش داده می‌شود.
          </p>
        </div>
        <Link href="/dashboard">بازگشت به پنل</Link>
      </header>

      {access?.integrationStatus ===
      "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED" ? (
        <Notice tone="error" title="پیکربندی ناقص">
          یکپارچه‌سازی اسپات‌پلیر پیاده‌سازی شده اما اعتبارنامه تنظیم نشده
          (IMPLEMENTED_BUT_CREDENTIALS_REQUIRED). تا تنظیم کلید API، صدور لایسنس
          ناموفق می‌ماند.
        </Notice>
      ) : null}

      {access?.integrationStatus === "DISABLED" ? (
        <Notice tone="information" title="غیرفعال">
          اسپات‌پلیر از پنل ادمین غیرفعال است (DISABLED).
        </Notice>
      ) : null}

      <div className="access-list">
        {items.length === 0 ? (
          <Notice tone="information" title="هنوز لایسنسی نیست">
            پس از خرید تأییدشده یا دریافت دوره رایگان، درخواست صدور اینجا دیده
            می‌شود.{" "}
            <Link href="/courses">مرور دوره‌ها</Link>
          </Notice>
        ) : (
          items.map((lic) => (
            <article key={lic.id} className="access-card">
              <div className="access-card__head">
                <h2>{lic.course?.title ?? lic.courseId}</h2>
                <Badge status={statusBadge(lic.status)}>
                  {licenseStatusLabel(lic.status)}
                </Badge>
              </div>
              <p className="access-card__meta">
                منبع:{" "}
                {lic.accessSource === "FREE_COURSE"
                  ? "دوره رایگان"
                  : "سفارش پرداخت‌شده"}
                {lic.orderId ? ` · سفارش ${lic.orderId.slice(0, 8)}…` : ""}
              </p>

              {lic.status === "SUCCEEDED" && lic.licenseKey ? (
                <div className="access-card__key">
                  <label htmlFor={`key-${lic.id}`}>کلید لایسنس</label>
                  <textarea
                    id={`key-${lic.id}`}
                    readOnly
                    rows={3}
                    value={lic.licenseKey}
                  />
                  {lic.licenseUrl ? (
                    <p>
                      <a href={lic.licenseUrl} target="_blank" rel="noreferrer">
                        لینک محتوای لایسنس
                      </a>
                    </p>
                  ) : null}
                </div>
              ) : null}

              {lic.status === "FAILED" ? (
                <Notice tone="error" title="صدور ناموفق">
                  {lic.lastError ??
                    "خطای نامشخص. در صورت تکرار، با پشتیبانی تماس بگیرید."}
                  {" "}
                  پرداخت شما (در صورت انجام) همچنان معتبر است — محور پرداخت و
                  صدور لایسنس جدا هستند.
                </Notice>
              ) : null}

              {lic.status === "PENDING" ||
              lic.status === "QUEUED" ||
              lic.status === "IN_PROGRESS" ? (
                <Notice tone="information" title="در حال پردازش">
                  درخواست در صف worker است. تا پاسخ رسمی اسپات‌پلیر، کلید ساخته
                  نمی‌شود.
                </Notice>
              ) : null}
            </article>
          ))
        )}
      </div>

      {instructions ? (
        <section className="access-instructions" aria-labelledby="howto">
          <h2 id="howto">راهنمای نصب پخش‌کننده</h2>
          <p>{instructions.playerDownloadHint}</p>
          <h3>پلتفرم‌های تأییدشده در سایت رسمی</h3>
          <ul>
            {instructions.confirmedPlatforms.map((p) => (
              <li key={p.id}>
                {platformLabel(p.id)}
                {p.version ? ` · نسخه ${p.version}` : ""}
              </li>
            ))}
          </ul>
          <h3>هنوز رسمی نشده</h3>
          <ul>
            {instructions.notYetAvailable.map((p) => (
              <li key={p.id}>
                {platformLabel(p.id)} — {p.note}
              </li>
            ))}
          </ul>
          <ol>
            {instructions.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>
      ) : null}
    </section>
  );
}
