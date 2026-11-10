"use client";

import { useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import type { SpotPlayerConfig } from "../lib/spotplayer-shared";
import { integrationStatusLabel } from "../lib/status-labels";

export function SpotPlayerAdminForm({
  initial,
}: {
  initial: SpotPlayerConfig;
}) {
  const [technicalEnabled, setTechnicalEnabled] = useState(
    initial.technicalEnabled,
  );
  const [testMode, setTestMode] = useState(initial.testMode);
  const [apiKey, setApiKey] = useState("");
  const [courseId, setCourseId] = useState("");
  const [spotId, setSpotId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/spotplayer/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technicalEnabled,
          testMode,
          ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
        }),
      });
      const data = (await res.json()) as {
        message?: string | string[];
        integrationStatus?: string;
      };
      if (!res.ok) {
        setError(
          Array.isArray(data.message)
            ? data.message.join("، ")
            : data.message || "ذخیره ناموفق",
        );
        return;
      }
      setApiKey("");
      setMessage(
        `ذخیره شد — وضعیت: ${
          data.integrationStatus
            ? integrationStatusLabel(data.integrationStatus)
            : "به‌روز شد"
        } (کلید کامل هرگز برنمی‌گردد).`,
      );
    } catch {
      setError("ارتباط برقرار نشد.");
    } finally {
      setBusy(false);
    }
  }

  async function saveMapping(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/spotplayer/admin/mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: courseId.trim(),
          spotPlayerCourseId: spotId.trim(),
          enabled: true,
        }),
      });
      const data = (await res.json()) as { message?: string | string[] };
      if (!res.ok) {
        setError(
          Array.isArray(data.message)
            ? data.message.join("، ")
            : data.message || "نگاشت ناموفق",
        );
        return;
      }
      setMessage("نگاشت دوره ذخیره شد.");
      setCourseId("");
      setSpotId("");
    } catch {
      setError("ارتباط برقرار نشد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sp-admin-forms">
      <form className="dashboard__block" onSubmit={(e) => void saveConfig(e)}>
        <h2>تنظیمات یکپارچه‌سازی</h2>
        <label className="sp-admin-check">
          <input
            type="checkbox"
            checked={technicalEnabled}
            onChange={(e) => setTechnicalEnabled(e.target.checked)}
          />
          technicalEnabled
        </label>
        <label className="sp-admin-check">
          <input
            type="checkbox"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
          />
          testMode (لایسنس تستی طبق API رسمی)
        </label>
        <Field
          id="sp-api-key"
          label={`کلید API جدید (فعلی: ${initial.apiKeyMasked ?? "ندارد"})`}
          name="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          autoComplete="off"
          placeholder="خالی بگذارید تا تغییر نکند — یا از env استفاده کنید"
        />
        <Button type="submit" variant="primary" disabled={busy} loading={busy}>
          ذخیره تنظیمات
        </Button>
      </form>

      <form className="dashboard__block" onSubmit={(e) => void saveMapping(e)}>
        <h2>افزودن نگاشت دوره</h2>
        <Field
          id="sp-course-id"
          label="شناسه دوره ژرفا (courseId)"
          name="courseId"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required
        />
        <Field
          id="sp-spot-id"
          label="شناسه دوره اسپات‌پلیر (ObjectId پنل)"
          name="spotPlayerCourseId"
          value={spotId}
          onChange={(e) => setSpotId(e.target.value)}
          required
        />
        <Button type="submit" variant="secondary" disabled={busy}>
          ذخیره نگاشت
        </Button>
      </form>

      {message ? (
        <Notice tone="success" title="انجام شد">
          {message}
        </Notice>
      ) : null}
      {error ? (
        <Notice tone="error" title="خطا">
          {error}
        </Notice>
      ) : null}
    </div>
  );
}
