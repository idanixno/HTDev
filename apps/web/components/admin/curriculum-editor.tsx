"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";
import type { AdminCourseDraft } from "../../lib/admin";

export function CurriculumEditor({
  course,
}: {
  course: AdminCourseDraft;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(task: () => Promise<unknown>) {
    setError(null);
    setLoading(true);
    try {
      await task();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "عملیات سرفصل ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  function addModule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    void run(async () => {
      await authFetch(`/api/admin/courses/${course.id}/modules`, {
        method: "POST",
        body: JSON.stringify({
          title: String(data.get("title") || "").trim(),
          summary: String(data.get("summary") || "").trim() || null,
          sortOrder: Number(data.get("sortOrder") || course.modules.length + 1),
        }),
      });
      form.reset();
    });
  }

  function addLesson(moduleId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const minutes = String(data.get("durationMinutes") || "").trim();
    void run(async () => {
      await authFetch(`/api/admin/courses/${course.id}/lessons`, {
        method: "POST",
        body: JSON.stringify({
          moduleId,
          title: String(data.get("title") || "").trim(),
          sortOrder: Number(data.get("sortOrder") || 0),
          durationMinutes: minutes ? Number(minutes) : null,
          isPreview: data.get("isPreview") === "on",
        }),
      });
      form.reset();
    });
  }

  return (
    <section className="curriculum-editor" aria-labelledby="curriculum-editor-heading">
      <header>
        <h2 id="curriculum-editor-heading">سرفصل</h2>
        <p>فصل‌ها و درس‌ها همین‌جا ذخیره می‌شوند. تعداد درس روی کارت دوره به‌روز می‌شود.</p>
      </header>
      {error ? (
        <Notice tone="error" title="سرفصل ذخیره نشد">
          {error}
        </Notice>
      ) : null}

      {course.modules.length === 0 ? (
        <p className="admin-page__hint">هنوز فصلی ثبت نشده است.</p>
      ) : (
        <ol className="curriculum-editor__modules">
          {course.modules.map((mod) => (
            <li key={mod.id} className="curriculum-editor__module">
              <div className="curriculum-editor__module-head">
                <strong>{mod.title}</strong>
                <Button
                  type="button"
                  variant="danger"
                  disabled={loading}
                  onClick={() =>
                    void run(() =>
                      authFetch(`/api/admin/modules/${mod.id}`, { method: "DELETE" }),
                    )
                  }
                >
                  حذف فصل
                </Button>
              </div>
              {mod.summary ? <p>{mod.summary}</p> : null}
              <ul>
                {mod.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <span>
                      {lesson.title}
                      {lesson.isPreview ? " · پیش‌نمایش" : ""}
                      {lesson.durationMinutes != null
                        ? ` · ${lesson.durationMinutes.toLocaleString("fa-IR")} دقیقه`
                        : ""}
                    </span>
                    <button
                      type="button"
                      className="text-button"
                      disabled={loading}
                      onClick={() =>
                        void run(() =>
                          authFetch(`/api/admin/lessons/${lesson.id}`, {
                            method: "DELETE",
                          }),
                        )
                      }
                    >
                      حذف
                    </button>
                  </li>
                ))}
              </ul>
              <form className="curriculum-editor__lesson" onSubmit={(event) => addLesson(mod.id, event)}>
                <Field id={`lesson-title-${mod.id}`} name="title" label="درس جدید" required />
                <Field
                  id={`lesson-order-${mod.id}`}
                  name="sortOrder"
                  label="ترتیب"
                  type="number"
                  defaultValue={String(mod.lessons.length + 1)}
                />
                <Field
                  id={`lesson-minutes-${mod.id}`}
                  name="durationMinutes"
                  label="دقیقه"
                  type="number"
                  min={0}
                />
                <label className="editor-check">
                  <input type="checkbox" name="isPreview" />
                  <span>پیش‌نمایش رایگان</span>
                </label>
                <Button type="submit" variant="secondary" disabled={loading}>
                  افزودن درس
                </Button>
              </form>
            </li>
          ))}
        </ol>
      )}

      <form className="curriculum-editor__add" onSubmit={addModule}>
        <h3>فصل جدید</h3>
        <Field id="module-title" name="title" label="عنوان فصل" required />
        <Field id="module-summary" name="summary" label="خلاصه فصل" />
        <Field
          id="module-order"
          name="sortOrder"
          label="ترتیب"
          type="number"
          defaultValue={String(course.modules.length + 1)}
        />
        <Button type="submit" disabled={loading}>
          افزودن فصل
        </Button>
      </form>
    </section>
  );
}
