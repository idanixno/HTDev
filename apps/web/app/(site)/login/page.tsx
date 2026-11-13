"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { AuthShell } from "../../../components/auth-shell";
import { authFetch } from "../../../lib/api-client";
import { REQUIRED_FIELD_MESSAGE } from "../../../lib/field-messages";
import { safeNextPath } from "../../../lib/safe-path";

type FieldKey = "identifier" | "password";
type FieldErrors = Partial<Record<FieldKey, string>>;

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = safeNextPath(search.get("next"), "/dashboard");
  const passwordChanged = search.get("notice") === "password";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function clearFieldError(key: FieldKey) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const nextErrors = { ...prev };
      delete nextErrors[key];
      return nextErrors;
    });
  }

  function showFieldError(key: FieldKey) {
    const empty =
      key === "identifier" ? !identifier.trim() : !password;
    setFieldErrors((prev) => {
      if (!empty) {
        if (!prev[key]) return prev;
        const nextErrors = { ...prev };
        delete nextErrors[key];
        return nextErrors;
      }
      return { ...prev, [key]: REQUIRED_FIELD_MESSAGE };
    });
  }

  function validateAll(): FieldErrors {
    const nextErrors: FieldErrors = {};
    if (!identifier.trim()) nextErrors.identifier = REQUIRED_FIELD_MESSAGE;
    if (!password) nextErrors.password = REQUIRED_FIELD_MESSAGE;
    else if (password.length < 8) {
      nextErrors.password = "رمز عبور باید حداقل ۸ نویسه باشد.";
    }
    return nextErrors;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const nextErrors = validateAll();
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await authFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });
      router.replace(next);
      router.refresh();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "ورود ناموفق بود.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="ورود به حساب"
      subtitle="با ایمیل یا نام کاربری وارد شوید."
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
        {formError ? (
          <Notice tone="error" title="ورود انجام نشد">
            {formError}
          </Notice>
        ) : null}
        <Field
          id="login-identifier"
          label="ایمیل یا نام کاربری"
          autoComplete="username"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            clearFieldError("identifier");
          }}
          onBlur={() => showFieldError("identifier")}
          error={fieldErrors.identifier}
          required
          aria-required="true"
        />
        <Field
          id="login-password"
          label="رمز عبور"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearFieldError("password");
          }}
          onBlur={() => showFieldError("password")}
          error={fieldErrors.password}
          required
          aria-required="true"
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
        <AuthShell
          title="ورود به حساب"
          subtitle="در حال آماده‌سازی…"
        >
          <p className="disinab__line">لطفاً صبر کنید.</p>
        </AuthShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
