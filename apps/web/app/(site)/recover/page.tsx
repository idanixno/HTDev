"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { AuthShell } from "../../../components/auth-shell";
import { authFetch } from "../../../lib/api-client";
import {
  REQUIRED_FIELD_MESSAGE,
  minLengthFieldError,
  requiredFieldError,
} from "../../../lib/field-messages";

type Step = "request" | "confirm";
type RequestField = "destination";
type ConfirmField = "code" | "newPassword";

export default function RecoverPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [destination, setDestination] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [requestErrors, setRequestErrors] = useState<
    Partial<Record<RequestField, string>>
  >({});
  const [confirmErrors, setConfirmErrors] = useState<
    Partial<Record<ConfirmField, string>>
  >({});
  const [loading, setLoading] = useState(false);

  async function onRequest(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const destinationError = requiredFieldError(destination);
    if (destinationError) {
      setRequestErrors({ destination: destinationError });
      return;
    }
    setRequestErrors({});
    setLoading(true);
    try {
      const data = await authFetch<{ message: string; challengeId: string }>(
        "/api/auth/recover/request",
        {
          method: "POST",
          body: JSON.stringify({ destination: destination.trim() }),
        },
      );
      setChallengeId(data.challengeId);
      setMessage(data.message);
      setStep("confirm");
      setConfirmErrors({});
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "درخواست ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  async function onConfirm(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const nextErrors: Partial<Record<ConfirmField, string>> = {};
    const codeError = requiredFieldError(code);
    if (codeError) nextErrors.code = codeError;
    const passwordError = minLengthFieldError(newPassword, 8, "password");
    if (passwordError) nextErrors.newPassword = passwordError;
    setConfirmErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await authFetch("/api/auth/recover/confirm", {
        method: "POST",
        body: JSON.stringify({
          challengeId,
          code: code.trim(),
          newPassword,
        }),
      });
      router.replace("/login?notice=password");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "تأیید کد ناموفق بود.");
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
          {formError ? (
            <Notice tone="error" title="خطا">
              {formError}
            </Notice>
          ) : null}
          <Field
            id="recover-destination"
            label="ایمیل یا موبایل"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setRequestErrors((prev) => {
                if (!prev.destination) return prev;
                const next = { ...prev };
                delete next.destination;
                return next;
              });
            }}
            onBlur={() => {
              if (!destination.trim()) {
                setRequestErrors({ destination: REQUIRED_FIELD_MESSAGE });
              }
            }}
            error={requestErrors.destination}
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
          {formError ? (
            <Notice tone="error" title="خطا">
              {formError}
            </Notice>
          ) : null}
          <Field
            id="recover-code"
            label="کد یک‌بارمصرف"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setConfirmErrors((prev) => {
                if (!prev.code) return prev;
                const next = { ...prev };
                delete next.code;
                return next;
              });
            }}
            onBlur={() => {
              if (!code.trim()) {
                setConfirmErrors((prev) => ({
                  ...prev,
                  code: REQUIRED_FIELD_MESSAGE,
                }));
              }
            }}
            error={confirmErrors.code}
            required
          />
          <Field
            id="recover-password"
            label="رمز عبور جدید"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setConfirmErrors((prev) => {
                if (!prev.newPassword) return prev;
                const next = { ...prev };
                delete next.newPassword;
                return next;
              });
            }}
            onBlur={() => {
              const err = minLengthFieldError(newPassword, 8, "password");
              if (err) {
                setConfirmErrors((prev) => ({ ...prev, newPassword: err }));
              }
            }}
            error={confirmErrors.newPassword}
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
              setFormError(null);
              setConfirmErrors({});
            }}
          >
            ارسال دوباره
          </button>
        </form>
      )}
    </AuthShell>
  );
}
