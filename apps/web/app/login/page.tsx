"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { AuthShell } from "../../components/auth-shell";
import { authFetch } from "../../lib/api-client";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";
  const passwordChanged = search.get("notice") === "password";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="ورود به حساب"
      subtitle="با نام کاربری، ایمیل یا موبایل وارد شوید."
      footer={
        <>
          <Link href="/register">ساخت حساب جدید</Link>
          <span aria-hidden="true">·</span>
          <Link href="/recover">بازیابی رمز عبور</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {passwordChanged ? (
          <Notice tone="success" title="رمز عوض شد">
            با رمز جدید وارد شوید. نشست‌های قبلی بسته شدند.
          </Notice>
        ) : null}
        {error ? (
          <Notice tone="error" title="ورود انجام نشد">
            {error}
          </Notice>
        ) : null}
        <Field
          id="login-identifier"
          label="نام کاربری / ایمیل / موبایل"
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <Field
          id="login-password"
          label="رمز عبور"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <Button type="submit" loading={loading} className="auth-form__submit">
          ورود
        </Button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="ورود به حساب" subtitle="در حال آماده‌سازی…">
          <p className="auth-page__subtitle">لطفاً صبر کنید.</p>
        </AuthShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
