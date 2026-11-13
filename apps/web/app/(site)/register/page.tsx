"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { AuthShell } from "../../../components/auth-shell";
import { authFetch } from "../../../lib/api-client";
import { REQUIRED_FIELD_MESSAGE } from "../../../lib/field-messages";

type FieldKey =
  | "username"
  | "email"
  | "phone"
  | "password"
  | "confirmPassword";

type FieldErrors = Partial<Record<FieldKey, string>>;

const USERNAME_RE = /^[a-zA-Z][a-zA-Z0-9_-]{2,31}$/;

function validateField(
  key: FieldKey,
  values: {
    username: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  },
): string | null {
  const username = values.username.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const { password, confirmPassword } = values;

  switch (key) {
    case "username":
      if (!username) return REQUIRED_FIELD_MESSAGE;
      if (username.length < 3) return "نام کاربری حداقل ۳ نویسه است.";
      if (!USERNAME_RE.test(username)) {
        return "نام کاربری باید با حرف لاتین شروع شود و فقط حرف، عدد، _ و - داشته باشد.";
      }
      return null;
    case "email":
      if (!email) return REQUIRED_FIELD_MESSAGE;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "ایمیل معتبر نیست.";
      }
      return null;
    case "phone":
      if (!phone) return REQUIRED_FIELD_MESSAGE;
      if (phone.replace(/\D/g, "").length < 10) {
        return "شماره موبایل معتبر نیست.";
      }
      return null;
    case "password":
      if (!password) return REQUIRED_FIELD_MESSAGE;
      if (password.length < 8) return "رمز عبور باید حداقل ۸ نویسه باشد.";
      return null;
    case "confirmPassword":
      if (!confirmPassword) return REQUIRED_FIELD_MESSAGE;
      if (confirmPassword !== password) {
        return "تکرار رمز با رمز عبور یکی نیست.";
      }
      return null;
    default:
      return null;
  }
}

function validateAll(values: {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}): FieldErrors {
  const keys: FieldKey[] = [
    "username",
    "email",
    "phone",
    "password",
    "confirmPassword",
  ];
  const next: FieldErrors = {};
  for (const key of keys) {
    const message = validateField(key, values);
    if (message) next[key] = message;
  }
  return next;
}

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const values = { username, email, phone, password, confirmPassword };

  function clearFieldError(key: FieldKey) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function showFieldError(key: FieldKey) {
    const message = validateField(key, values);
    setFieldErrors((prev) => {
      if (!message) {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: message };
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const nextErrors = validateAll(values);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await authFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "ثبت‌نام ناموفق بود.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="ثبت‌نام دانشجو"
      subtitle="حساب شخصی‌ات را بساز و مسیر یادگیری را شروع کن."
      footer={
        <>
          حساب داری؟ <Link href="/login">ورود</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {formError ? (
          <Notice tone="error" title="ثبت‌نام انجام نشد">
            {formError}
          </Notice>
        ) : null}
        <Field
          id="reg-username"
          label="نام کاربری"
          autoComplete="username"
          hint="حروف لاتین، عدد، _ و -"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            clearFieldError("username");
          }}
          onBlur={() => showFieldError("username")}
          error={fieldErrors.username}
          required
          aria-required="true"
        />
        <Field
          id="reg-email"
          label="ایمیل"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError("email");
          }}
          onBlur={() => showFieldError("email")}
          error={fieldErrors.email}
          required
          aria-required="true"
        />
        <Field
          id="reg-phone"
          label="موبایل"
          type="tel"
          autoComplete="tel"
          hint="مثال: ۰۹۱۲۱۲۳۴۵۶۷"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            clearFieldError("phone");
          }}
          onBlur={() => showFieldError("phone")}
          error={fieldErrors.phone}
          required
          aria-required="true"
        />
        <Field
          id="reg-password"
          label="رمز عبور"
          type="password"
          autoComplete="new-password"
          hint="حداقل ۸ کاراکتر"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearFieldError("password");
            if (confirmPassword) clearFieldError("confirmPassword");
          }}
          onBlur={() => showFieldError("password")}
          error={fieldErrors.password}
          required
          aria-required="true"
          minLength={8}
        />
        <Field
          id="reg-confirm-password"
          label="تکرار رمز عبور"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearFieldError("confirmPassword");
          }}
          onBlur={() => showFieldError("confirmPassword")}
          error={fieldErrors.confirmPassword}
          required
          aria-required="true"
          minLength={8}
        />
        <Button type="submit" loading={loading} className="auth-form__submit">
          ساخت حساب
        </Button>
      </form>
    </AuthShell>
  );
}
