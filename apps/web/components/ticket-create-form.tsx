"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../lib/api-client";

type CourseOption = { slug: string; title: string };

export function TicketCreateForm({ courses }: { courses: CourseOption[] }) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [courseSlug, setCourseSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const ticket = await authFetch<{ id: string }>("/api/tickets", {
        method: "POST",
        body: JSON.stringify({
          subject,
          description,
          courseSlug: courseSlug || undefined,
        }),
      });
      router.push(`/dashboard/tickets/${ticket.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت تیکت ناموفق بود.");
      setPending(false);
    }
  }

  return (
    <form className="ticket-form disinab-tickets__form" onSubmit={onSubmit}>
      {error ? (
        <Notice tone="error" title="خطا">
          {error}
        </Notice>
      ) : null}

      <Field
        id="ticket-subject"
        label="موضوع"
        name="subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
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

      <label className="ticket-form__label" htmlFor="ticket-desc">
        شرح مشکل
      </label>
      <textarea
        id="ticket-desc"
        className="ticket-form__textarea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        minLength={10}
        rows={6}
      />

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "در حال ثبت…" : "ثبت تیکت"}
      </Button>
    </form>
  );
}
