"use client";

import { useState, type FormEvent } from "react";
import { Button, Field } from "@zharfa/ui";
import {
  REQUIRED_FIELD_MESSAGE,
  requiredFieldError,
} from "../lib/field-messages";

export function CourseWaitlistForm({
  slug,
  defaultPhone = "",
}: {
  slug: string;
  defaultPhone?: string;
}) {
  const [phone, setPhone] = useState(defaultPhone);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const local = requiredFieldError(phone);
    if (local) {
      setPhoneError(local);
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setPhoneError("شماره موبایل معتبر نیست.");
      return;
    }
    setPhoneError(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/courses/${encodeURIComponent(slug)}/waitlist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phone.trim() }),
        },
      );
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!res.ok) {
        setFormError(data.message ?? "ثبت پیش‌ثبت‌نام ممکن نشد.");
        return;
      }
      setDone(true);
    } catch {
      setFormError("ارتباط برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="course-waitlist__ok" role="status">
        <span>پیش‌ثبت‌نام شما انجام شد</span>
        <span>به محض انتشار دوره اطلاع می‌دهیم</span>
      </p>
    );
  }

  return (
    <form className="course-waitlist" onSubmit={submit} noValidate>
      <Field
        id={`waitlist-phone-${slug}`}
        label="شماره موبایل"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        dir="ltr"
        placeholder="09xxxxxxxxx"
        value={phone}
        onChange={(event) => {
          setPhone(event.target.value);
          setPhoneError(null);
        }}
        onBlur={() => {
          if (!phone.trim()) setPhoneError(REQUIRED_FIELD_MESSAGE);
        }}
        error={phoneError}
        required
      />
      <Button type="submit" loading={loading}>
        پیش‌ثبت‌نام
      </Button>
      {formError ? <p className="course-waitlist__error">{formError}</p> : null}
      <p className="course-waitlist__hint">
        فقط برای خبر انتشار همین دوره استفاده می‌شود.
      </p>
    </form>
  );
}
