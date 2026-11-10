import { Notice } from "@zharfa/ui";
import { SpotPlayerAdminForm } from "../../../components/spotplayer-admin-form";
import {
  fetchAdminLicenses,
  fetchSpotDiagnostics,
  fetchSpotMappings,
} from "../../../lib/spotplayer";

export default async function AdminSpotPlayerPage() {
  const [diagnostics, mappings, licenses] = await Promise.all([
    fetchSpotDiagnostics(),
    fetchSpotMappings(),
    fetchAdminLicenses(),
  ]);

  return (
    <section className="admin-page" aria-labelledby="admin-sp-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">تنظیمات</p>
          <h1 id="admin-sp-heading" className="admin-page__title">
            اسپات‌پلیر
          </h1>
          <p className="admin-page__subtitle">
            کلید API ماسک‌شده، نگاشت دوره، و تشخیص وضعیت — بدون کلید ساختگی.
          </p>
        </div>
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

          <div className="admin-split">
            <article className="admin-panel">
              <h2>تشخیص</h2>
              <ul className="admin-list">
                {Object.entries(diagnostics.counts).map(([k, v]) => (
                  <li key={k}>
                    {k}: {v.toLocaleString("fa-IR")}
                  </li>
                ))}
              </ul>
              <ul className="admin-list">
                {diagnostics.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </article>

            <article className="admin-panel">
              <h2>نگاشت دوره</h2>
              {mappings.length === 0 ? (
                <p className="admin-page__hint">هنوز نگاشتی ثبت نشده.</p>
              ) : (
                <ul className="admin-list">
                  {mappings.map((m) => (
                    <li key={m.id}>
                      {m.course.title} → <code>{m.spotPlayerCourseId}</code>
                      {m.enabled ? "" : " (غیرفعال)"}
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="admin-panel">
              <h2>لایسنس‌های اخیر</h2>
              {licenses.length === 0 ? (
                <p className="admin-page__hint">موردی نیست.</p>
              ) : (
                <ul className="admin-list">
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
