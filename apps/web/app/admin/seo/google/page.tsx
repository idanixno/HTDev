"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Notice } from "@zharfa/ui";
import { authFetch } from "../../../../lib/api-client";

type Status = {
  code: "NOT_CONFIGURED" | "NOT_CONNECTED" | "CONNECTED" | string;
  message: string;
  credentialsPresent: boolean;
  connected: boolean;
  metrics: null;
};

export default function GoogleSeoPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void authFetch<Status>("/api/admin/seo/google/status")
      .then(setStatus)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "خطا در دریافت وضعیت"),
      );
  }, []);

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">سئو</p>
          <h1 className="admin-page__title">گوگل Search Console / GA4</h1>
          <p className="admin-page__subtitle">
            اتصال واقعی با OAuth. تا وقتی متصل نشوید هیچ نمودار یا عددی
            شبیه‌سازی نمی‌شود.
          </p>
        </div>
      </header>

      {error ? (
        <Notice tone="error" title="خطا">
          {error}
        </Notice>
      ) : null}

      <div className="admin-panel">
        <h2>وضعیت</h2>
        {!status ? (
          <p>در حال بارگذاری…</p>
        ) : (
          <>
            <p>
              کد: <strong>{status.code}</strong>
            </p>
            <p>{status.message}</p>
            <p>
              اعتبارنامه OAuth:{" "}
              {status.credentialsPresent ? "موجود" : "ندارد"} · اتصال ملک:{" "}
              {status.connected ? "متصل" : "متصل نیست"}
            </p>
            <Notice tone="information" title="بدون دادهٔ جعلی">
              بخش متریک‌ها خالی است تا OAuth کامل و همگام‌سازی واقعی انجام شود.
            </Notice>
            <div className="editor-form__actions" style={{ marginTop: 16 }}>
              {status.code === "NOT_CONFIGURED" ? (
                <Button href="/admin/integrations">رفتن به یکپارچه‌سازی‌ها</Button>
              ) : (
                <Button type="button" disabled>
                  اتصال Google (نیاز به تکمیل callback در پروداکشن)
                </Button>
              )}
              <Button href="/admin/seo" variant="secondary">
                بازگشت به مرکز سئو
              </Button>
            </div>
            <p style={{ marginTop: 12, fontSize: 13 }}>
              پس از ست‌کردن Client ID/Secret، authorize URL از API{" "}
              <code>/admin/seo/google/authorize-url</code> در دسترس است. ذخیرهٔ
              refresh token و sync داده در مرحلهٔ اتصال پروداکشن فعال می‌شود.
            </p>
            <p>
              <Link href="/admin/integrations">مدیریت کلیدها</Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
