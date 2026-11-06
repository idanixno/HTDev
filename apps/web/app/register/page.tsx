"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { AuthShell } from "../../components/auth-shell";
import { authFetch } from "../../lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          phone: phone.trim() || undefined,
          displayName,
          password,
        }),
      });
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت‌نام ناموفق بود.");
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
        {error ? (
          <Notice tone="error" title="ثبت‌نام انجام نشد">
            {error}
          </Notice>
        ) : null}
        <Field
          id="reg-displayName"
          label="نام نمایشی"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <Field
          id="reg-username"
          label="نام کاربری"
          autoComplete="username"
          hint="حروف لاتین، عدد، _ و -"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Field
          id="reg-email"
          label="ایمیل"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          id="reg-phone"
          label="موبایل (اختیاری)"
          type="tel"
          autoComplete="tel"
          hint="مثال: ۰۹۱۲۱۲۳۴۵۶۷"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Field
          id="reg-password"
          label="رمز عبور"
          type="password"
          autoComplete="new-password"
          hint="حداقل ۸ کاراکتر"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <Button type="submit" loading={loading} className="auth-form__submit">
          ساخت حساب
        </Button>
      </form>
    </AuthShell>
  );
}
