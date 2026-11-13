"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../lib/api-client";
import {
  minLengthFieldError,
  requiredFieldError,
} from "../lib/field-messages";

type CourseOption = { slug: string; title: string };
type FieldKey = "subject" | "description";

export function TicketCreateForm({ courses }: { courses: CourseOption[] }) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [courseSlug, setCourseSlug] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function clearError(key: FieldKey) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    const subjectError =
      requiredFieldError(subject) ??
      (subject.trim().length < 3
        ? minLengthFieldError(subject, 3)
        : null);
    if (subjectError) nextErrors.subject = subjectError;
    const descriptionError =
      requiredFieldError(description) ??
      (description.trim().length < 10
        ? minLengthFieldError(description, 10)
        : null);
    if (descriptionError) nextErrors.description = descriptionError;
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    try {
      const ticket = await authFetch<{ id: string }>("/api/tickets", {
        method: "POST",
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim(),
          courseSlug: courseSlug || undefined,
        }),
      });
      router.push(`/dashboard/tickets/${ticket.id}`);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "ثبت تیکت ناموفق بود.");
      setPending(false);
    }
  }

  return (
    <form
      className="ticket-form disinab-tickets__form"
      onSubmit={onSubmit}
      noValidate
    >
      {formError ? (
        <Notice tone="error" title="خطا">
          {formError}
        </Notice>
      ) : null}

      <Field
        id="ticket-subject"
        label="موضوع"
        name="subject"
        value={subject}
        onChange={(e) => {
          setSubject(e.target.value);
          clearError("subject");
        }}
        onBlur={() => {
          const err =
            requiredFieldError(subject) ??
            (subject.trim().length > 0 && subject.trim().length < 3
              ? minLengthFieldError(subject, 3)
              : null);
          if (err) setFieldErrors((prev) => ({ ...prev, subject: err }));
        }}
        error={fieldErrors.subject}
        required
        minLength={3}
        maxLength={200}
      />

      <label className="ticket-form__label" htmlFor="ticket-course">
        دوره مرتبط (اختیاری)
      </label>
      <select
        id="ticket-course"
        className="ticket-form__select"
        value={courseSlug}
        onChange={(e) => setCourseSlug(e.target.value)}
        disabled={courses.length === 0}
      >
        <option value="">
          {courses.length === 0
            ? "— هنوز دوره‌ای در حساب نیست —"
            : "— بدون دوره —"}
        </option>
        {courses.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.title}
          </option>
        ))}
      </select>

      <div
        className={
          "z-field" + (fieldErrors.description ? " z-field--error" : "")
        }
      >
        <label className="ticket-form__label z-field__label" htmlFor="ticket-desc">
          شرح مشکل
        </label>
        <textarea
          id="ticket-desc"
          className="ticket-form__textarea z-field__control"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            clearError("description");
          }}
          onBlur={() => {
            const err =
              requiredFieldError(description) ??
              (description.trim().length > 0 && description.trim().length < 10
                ? minLengthFieldError(description, 10)
                : null);
            if (err) {
              setFieldErrors((prev) => ({ ...prev, description: err }));
            }
          }}
          required
          minLength={10}
          rows={6}
          aria-invalid={fieldErrors.description ? true : undefined}
          aria-describedby={
            fieldErrors.description ? "ticket-desc-error" : undefined
          }
        />
        {fieldErrors.description ? (
          <p className="z-field__error" id="ticket-desc-error" role="alert">
            {fieldErrors.description}
          </p>
        ) : null}
      </div>

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "در حال ثبت…" : "ثبت تیکت"}
      </Button>
    </form>
  );
}
