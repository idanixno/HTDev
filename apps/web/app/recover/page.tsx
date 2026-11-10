"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { AuthShell } from "../../components/auth-shell";
import { authFetch } from "../../lib/api-client";

type Step = "request" | "confirm";

export default function RecoverPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [destination, setDestination] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const data = await authFetch<{ message: string; challengeId: string }>(
        "/api/auth/recover/request",
        {
          method: "POST",
          body: JSON.stringify({ destination }),
        },
      );
      setChallengeId(data.challengeId);
      setMessage(data.message);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "درخواست ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  async function onConfirm(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authFetch("/api/auth/recover/confirm", {
        method: "POST",
        body: JSON.stringify({ challengeId, code, newPassword }),
      });
      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تأیید کد ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="بازیابی رمز عبور"
      subtitle="کد یک‌بارمصرف به ایمیل یا موبایل ثبت‌شده ارسال می‌شود."
      footer={
        <>
          <Link href="/login">بازگشت به ورود</Link>
        </>
      }
    >
      {step === "request" ? (
        <form className="auth-form" onSubmit={onRequest} noValidate>
          {error ? (
            <Notice tone="error" title="خطا">
              {error}
            </Notice>
          ) : null}
          <Field
            id="recover-destination"
            label="ایمیل یا موبایل"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
          <Button type="submit" loading={loading} className="auth-form__submit">
            ارسال کد
          </Button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={onConfirm} noValidate>
          {message ? (
            <Notice tone="information" title="درخواست ثبت شد">
              {message}
            </Notice>
          ) : null}
          {error ? (
            <Notice tone="error" title="خطا">
              {error}
            </Notice>
          ) : null}
          <Field
            id="recover-code"
            label="کد یک‌بارمصرف"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <Field
            id="recover-password"
            label="رمز عبور جدید"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <Button type="submit" loading={loading} className="auth-form__submit">
            تنظیم رمز جدید
          </Button>
          <button
            type="button"
            className="auth-form__ghost-link"
            onClick={() => {
              setStep("request");
              setError(null);
            }}
          >
            ارسال دوباره
          </button>
        </form>
      )}
    </AuthShell>
  );
}
