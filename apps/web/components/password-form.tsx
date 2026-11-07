"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../lib/api-client";

export function PasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword") || "");
    const newPassword = String(form.get("newPassword") || "");
    const confirm = String(form.get("confirmPassword") || "");
    if (newPassword !== confirm) {
      setError("تکرار رمز با رمز جدید یکی نیست.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authFetch("/api/auth/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      router.replace("/login?notice=password");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تغییر رمز ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="editor-form" onSubmit={onSubmit}>
      {error ? (
        <Notice tone="error" title="رمز عوض نشد">
          {error}
        </Notice>
      ) : null}
      <Field
        id="current-password"
        name="currentPassword"
        label="رمز فعلی"
        type="password"
        autoComplete="current-password"
        required
        minLength={8}
      />
      <Field
        id="new-password"
        name="newPassword"
        label="رمز جدید"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="حداقل ۸ نویسه. بعد از تغییر، همه نشست‌ها بسته می‌شوند."
      />
      <Field
        id="confirm-password"
        name="confirmPassword"
        label="تکرار رمز جدید"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
      />
      <Button type="submit" loading={loading}>
        تغییر رمز و خروج
      </Button>
    </form>
  );
}
