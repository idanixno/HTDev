"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../../lib/api-client";

type IntegrationView = {
  provider: "OPENAI" | "ANTHROPIC" | "GOOGLE_OAUTH";
  credentialsStatus: "MISSING" | "PRESENT";
  secretMasked: string | null;
  config: Record<string, unknown> | null;
  connectedAt: string | null;
  lastTestedAt: string | null;
  lastError: string | null;
  oauthConnected: boolean;
};

const LABELS: Record<IntegrationView["provider"], string> = {
  OPENAI: "OpenAI (دستیار SEO)",
  GOOGLE_OAUTH: "Google OAuth (Search Console / GA4)",
  ANTHROPIC: "Anthropic (آمادهٔ آینده)",
};

export default function IntegrationsPage() {
  const [items, setItems] = useState<IntegrationView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [openaiKey, setOpenaiKey] = useState("");
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleSecret, setGoogleSecret] = useState("");

  async function load() {
    const data = await authFetch<IntegrationView[]>("/api/admin/integrations");
    setItems(data);
    const google = data.find((i) => i.provider === "GOOGLE_OAUTH");
    const clientId = google?.config?.clientId;
    if (typeof clientId === "string") setGoogleClientId(clientId);
  }

  useEffect(() => {
    void load().catch((err) =>
      setError(err instanceof Error ? err.message : "بارگذاری ناموفق"),
    );
  }, []);

  async function saveOpenAi(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await authFetch("/api/admin/integrations", {
        method: "POST",
        body: JSON.stringify({
          provider: "OPENAI",
          secret: openaiKey.trim() || undefined,
        }),
      });
      setOpenaiKey("");
      setOk("کلید OpenAI ذخیره شد (رمزنگاری‌شده).");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ناموفق");
    } finally {
      setBusy(false);
    }
  }

  async function clearOpenAi() {
    setBusy(true);
    setError(null);
    try {
      await authFetch("/api/admin/integrations", {
        method: "POST",
        body: JSON.stringify({ provider: "OPENAI", clearSecret: true }),
      });
      setOk("کلید OpenAI پاک شد.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "پاک‌سازی ناموفق");
    } finally {
      setBusy(false);
    }
  }

  async function saveGoogle(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await authFetch("/api/admin/integrations", {
        method: "POST",
        body: JSON.stringify({
          provider: "GOOGLE_OAUTH",
          secret: googleSecret.trim() || undefined,
          config: { clientId: googleClientId.trim() },
        }),
      });
      setGoogleSecret("");
      setOk("اعتبارنامه Google OAuth ذخیره شد. هنوز متصل نیست.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ناموفق");
    } finally {
      setBusy(false);
    }
  }

  async function testProvider(provider: IntegrationView["provider"]) {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const data = await authFetch<{
        ok?: boolean;
        error?: string;
        message?: string;
        code?: string;
      }>("/api/admin/integrations/test", {
        method: "POST",
        body: JSON.stringify({ provider }),
      });
      if (data.ok) setOk(data.message || "آزمایش موفق بود.");
      else setError(data.error || data.message || "آزمایش ناموفق");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "آزمایش ناموفق");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">سیستم</p>
          <h1 className="admin-page__title">یکپارچه‌سازی‌ها</h1>
          <p className="admin-page__subtitle">
            کلیدها رمزنگاری‌شده در پایگاه ذخیره می‌شوند و هرگز کامل به مرورگر
            برنمی‌گردند. برای پروداکشن از همین صفحه تنظیم کنید.
          </p>
        </div>
      </header>

      {error ? (
        <Notice tone="error" title="خطا">
          {error}
        </Notice>
      ) : null}
      {ok ? (
        <Notice tone="success" title="انجام شد">
          {ok}
        </Notice>
      ) : null}

      <ul className="admin-kpis__grid" style={{ marginBottom: 24 }}>
        {items.map((item) => (
          <li key={item.provider} className="admin-kpi" data-tone={item.credentialsStatus === "PRESENT" ? "success" : "pending"}>
            <p className="admin-kpi__label">{LABELS[item.provider]}</p>
            <p className="admin-kpi__value">
              {item.credentialsStatus === "PRESENT" ? "آماده" : "ندارد"}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--zharfa-text-secondary)" }}>
              {item.secretMasked ? `ماسک: ${item.secretMasked}` : "بدون کلید"}
              {item.oauthConnected ? " · OAuth متصل" : ""}
            </p>
          </li>
        ))}
      </ul>

      <div className="admin-panel" style={{ marginBottom: 20 }}>
        <h2>OpenAI</h2>
        <form className="editor-form" onSubmit={(e) => void saveOpenAi(e)}>
          <Field
            id="openai-key"
            label="API Key"
            mono
            dir="ltr"
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-…"
          />
          <div className="editor-form__actions">
            <Button type="submit" disabled={busy || !openaiKey.trim()}>
              ذخیره کلید
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => void testProvider("OPENAI")}
            >
              آزمایش اتصال
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={busy}
              onClick={() => void clearOpenAi()}
            >
              پاک کردن
            </Button>
          </div>
        </form>
      </div>

      <div className="admin-panel" style={{ marginBottom: 20 }}>
        <h2>Google OAuth</h2>
        <p style={{ color: "var(--zharfa-text-secondary)", lineHeight: 1.7 }}>
          فقط ذخیرهٔ Client ID/Secret. دادهٔ Search Console/GA4 تا اتصال واقعی
          نمایش داده نمی‌شود (بدون شبیه‌سازی).
        </p>
        <form className="editor-form" onSubmit={(e) => void saveGoogle(e)}>
          <Field
            id="google-client-id"
            label="Client ID"
            mono
            dir="ltr"
            value={googleClientId}
            onChange={(e) => setGoogleClientId(e.target.value)}
          />
          <Field
            id="google-client-secret"
            label="Client Secret"
            mono
            dir="ltr"
            type="password"
            value={googleSecret}
            onChange={(e) => setGoogleSecret(e.target.value)}
            placeholder="در صورت تغییر، مقدار جدید را وارد کنید"
          />
          <div className="editor-form__actions">
            <Button type="submit" disabled={busy || !googleClientId.trim()}>
              ذخیره اعتبارنامه
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => void testProvider("GOOGLE_OAUTH")}
            >
              بررسی وضعیت
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
