import Link from "next/link";
import { Notice } from "@zharfa/ui";
import {
  fetchAdminLicenses,
  fetchSpotDiagnostics,
  fetchSpotMappings,
} from "../../../../lib/spotplayer";
import { SpotPlayerAdminForm } from "../../../../components/spotplayer-admin-form";

export default async function SpotPlayerAdminPage() {
  const [diagnostics, mappings, licenses] = await Promise.all([
    fetchSpotDiagnostics(),
    fetchSpotMappings(),
    fetchAdminLicenses(),
  ]);

  return (
    <section className="dashboard" aria-labelledby="sp-admin-heading">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">ادمین</p>
          <h1 id="sp-admin-heading" className="dashboard__title">
            پیکربندی اسپات‌پلیر
          </h1>
          <p className="dashboard__subtitle">
            کلید API فقط به‌صورت masked نمایش داده می‌شود. موفقیت لایسنس فقط با
            پاسخ واقعی اسپات‌پلیر ثبت می‌شود.
          </p>
        </div>
        <Link href="/dashboard">بازگشت</Link>
      </header>

      {!diagnostics ? (
        <Notice tone="error" title="خطا">
          خواندن تنظیمات ممکن نشد.
        </Notice>
      ) : (
        <>
          <Notice
            tone={
              diagnostics.config.integrationStatus === "IMPLEMENTED"
                ? "success"
                : "warning"
            }
            title={
              diagnostics.config.integrationStatus === "IMPLEMENTED"
                ? "پیکربندی کامل است"
                : "پیکربندی ناقص"
            }
          >
            {diagnostics.config.integrationStatus === "IMPLEMENTED"
              ? "کلید API تنظیم شده و صدور لایسنس می‌تواند انجام شود."
              : "اعتبارنامه اسپات‌پلیر تنظیم نشده است. تا تنظیم کلید API، صدور لایسنس ناموفق می‌ماند."}{" "}
            وضعیت: {diagnostics.config.integrationStatus} · اعتبارنامه:{" "}
            {diagnostics.config.credentialsStatus}
            {diagnostics.config.apiKeyMasked
              ? ` · ${diagnostics.config.apiKeyMasked}`
              : " · بدون کلید"}{" "}
            · منبع: {diagnostics.config.source}
          </Notice>

          <SpotPlayerAdminForm initial={diagnostics.config} />

          <div className="dashboard__grid">
            <article className="dashboard__block">
              <h2>تشخیص</h2>
              <ul className="dashboard__links">
                {Object.entries(diagnostics.counts).map(([k, v]) => (
                  <li key={k}>
                    {k}: {v.toLocaleString("fa-IR")}
                  </li>
                ))}
              </ul>
              <ul>
                {diagnostics.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </article>

            <article className="dashboard__block">
              <h2>نگاشت دوره ↔ SpotPlayer</h2>
              {mappings.length === 0 ? (
                <p>هنوز نگاشتی ثبت نشده. از API ادمین یا فرم زیر استفاده کنید.</p>
              ) : (
                <ul className="dashboard__links">
                  {mappings.map((m) => (
                    <li key={m.id}>
                      {m.course.title} → <code>{m.spotPlayerCourseId}</code>
                      {m.enabled ? "" : " (غیرفعال)"}
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="dashboard__block">
              <h2>لایسنس‌های اخیر</h2>
              {licenses.length === 0 ? (
                <p>موردی نیست.</p>
              ) : (
                <ul className="dashboard__links">
                  {(
                    licenses as {
                      id: string;
                      status: string;
                      course?: { title?: string };
                      user?: { username?: string };
                      lastError?: string | null;
                    }[]
                  )
                    .slice(0, 20)
                    .map((lic) => (
                      <li key={lic.id}>
                        {lic.course?.title ?? lic.id} · {lic.user?.username} ·{" "}
                        {lic.status}
                        {lic.lastError ? ` — ${lic.lastError}` : ""}
                      </li>
                    ))}
                </ul>
              )}
            </article>
          </div>
        </>
      )}
    </section>
  );
}
