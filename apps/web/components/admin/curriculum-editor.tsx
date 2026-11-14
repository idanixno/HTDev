"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";
import type { AdminCourseDraft } from "../../lib/admin";

type Lesson = AdminCourseDraft["modules"][number]["lessons"][number];
type Module = AdminCourseDraft["modules"][number];

const MAX_VIDEO_BYTES = 150 * 1024 * 1024;

export function CurriculumEditor({ course }: { course: AdminCourseDraft }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [draftKey, setDraftKey] = useState(0);

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

  function saveModule(moduleId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void run(async () => {
      await authFetch(`/api/admin/modules/${moduleId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: String(data.get("title") || "").trim(),
          summary: String(data.get("summary") || "").trim() || null,
          sortOrder: Number(data.get("sortOrder") || 0),
        }),
      });
      setEditingModule(null);
    });
  }

  function removeModule(mod: Module) {
    if (!window.confirm(`سرفصل «${mod.title}» و جلسه‌هایش حذف شوند؟`)) return;
    void run(() => authFetch(`/api/admin/modules/${mod.id}`, { method: "DELETE" }));
  }

  function addLesson(moduleId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    void run(async () => {
      await authFetch(`/api/admin/courses/${course.id}/lessons`, {
        method: "POST",
        body: JSON.stringify(lessonPayload(new FormData(form), moduleId)),
      });
      form.reset();
      setDraftKey((key) => key + 1);
    });
  }

  function saveLesson(lesson: Lesson, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const moduleId = lesson.moduleId;
    if (!moduleId) return;
    void run(async () => {
      await authFetch(`/api/admin/lessons/${lesson.id}`, {
        method: "PATCH",
        body: JSON.stringify(lessonPayload(new FormData(event.currentTarget), moduleId)),
      });
      setEditingLesson(null);
    });
  }

  function removeLesson(lesson: Lesson) {
    if (!window.confirm(`جلسه «${lesson.title}» حذف شود؟`)) return;
    void run(() => authFetch(`/api/admin/lessons/${lesson.id}`, { method: "DELETE" }));
  }

  return (
    <section className="curriculum-editor" aria-labelledby="curriculum-editor-heading">
      <header>
        <h2 id="curriculum-editor-heading">سرفصل‌ها و جلسه‌ها</h2>
        <p>
          سرفصل برای همهٔ دوره‌ها نمایش داده می‌شود. اگر دوره روی اسپات‌پلیر باشد، ویدیوی اصلی
          آنجا پخش می‌شود؛ فقط برای جلسه‌های «پیش‌نمایش» می‌توانید ویدیوی کوتاه روی سایت بگذارید.
          برچسب پیش‌نمایش را از همین‌جا برای هر جلسه روشن یا خاموش کنید.
        </p>
      </header>
      {error ? (
        <Notice tone="error" title="سرفصل ذخیره نشد">
          {error}
        </Notice>
      ) : null}

      {course.modules.length === 0 ? (
        <p className="admin-page__hint">هنوز سرفصلی ثبت نشده است.</p>
      ) : (
        <ol className="curriculum-editor__modules">
          {course.modules.map((mod) => (
            <li key={mod.id} className="curriculum-editor__module">
              {editingModule === mod.id ? (
                <form className="curriculum-editor__edit" onSubmit={(event) => saveModule(mod.id, event)}>
                  <Field id={`module-title-${mod.id}`} name="title" label="عنوان سرفصل" defaultValue={mod.title} required />
                  <Field
                    id={`module-summary-${mod.id}`}
                    name="summary"
                    label="خلاصه سرفصل"
                    defaultValue={mod.summary ?? ""}
                  />
                  <Field
                    id={`module-order-${mod.id}`}
                    name="sortOrder"
                    label="ترتیب"
                    type="number"
                    defaultValue={String(mod.sortOrder)}
                  />
                  <div className="curriculum-editor__actions">
                    <Button type="submit" disabled={loading}>
                      ذخیره سرفصل
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setEditingModule(null)}>
                      انصراف
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="curriculum-editor__row">
                  <div>
                    <strong>{mod.title}</strong>
                    {mod.summary ? <p>{mod.summary}</p> : null}
                  </div>
                  <div className="curriculum-editor__actions">
                    <Button type="button" variant="secondary" disabled={loading} onClick={() => setEditingModule(mod.id)}>
                      ویرایش سرفصل
                    </Button>
                    <Button type="button" variant="danger" disabled={loading} onClick={() => removeModule(mod)}>
                      حذف سرفصل
                    </Button>
                  </div>
                </div>
              )}

              <details className="curriculum-editor__content">
                <summary>
                  <strong>{mod.lessons.length.toLocaleString("fa-IR")} جلسه</strong>
                  <span>نمایش و مدیریت جلسه‌ها</span>
                </summary>
                <ul>
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      {editingLesson === lesson.id ? (
                        <form className="curriculum-editor__edit" onSubmit={(event) => saveLesson(lesson, event)}>
                          <LessonFields
                            idPrefix={`edit-${lesson.id}`}
                            title={lesson.title}
                            summary={lesson.summary ?? ""}
                            sortOrder={String(lesson.sortOrder)}
                            minutes={lesson.durationMinutes == null ? "" : String(lesson.durationMinutes)}
                            isPreview={lesson.isPreview}
                            video={lesson.videoAsset ?? ""}
                          />
                          <div className="curriculum-editor__actions">
                            <Button type="submit" disabled={loading}>
                              ذخیره جلسه
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => setEditingLesson(null)}>
                              انصراف
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="curriculum-editor__row">
                          <span>
                            {lesson.title}
                            {lesson.isPreview ? (
                              <em className="curriculum-editor__preview-tag"> پیش‌نمایش</em>
                            ) : null}
                            {lesson.durationMinutes != null
                              ? ` · ${lesson.durationMinutes.toLocaleString("fa-IR")} دقیقه`
                              : ""}
                            {lesson.videoAsset ? " · ویدیوی سایت" : " · بدون ویدیوی سایت"}
                          </span>
                          <div className="curriculum-editor__actions">
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={loading}
                              onClick={() => setEditingLesson(lesson.id)}
                            >
                              ویرایش
                            </Button>
                            <button
                              type="button"
                              className="text-button"
                              disabled={loading}
                              onClick={() => removeLesson(lesson)}
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                <form className="curriculum-editor__lesson" onSubmit={(event) => addLesson(mod.id, event)}>
                  <h3>جلسه جدید</h3>
                  <LessonFields
                    key={`${mod.id}-${draftKey}`}
                    idPrefix={`new-${mod.id}-${draftKey}`}
                    title=""
                    summary=""
                    sortOrder={String(mod.lessons.length + 1)}
                    minutes=""
                    isPreview={false}
                    video=""
                  />
                  <Button type="submit" variant="secondary" disabled={loading}>
                    افزودن جلسه
                  </Button>
                </form>
              </details>
            </li>
          ))}
        </ol>
      )}

      <form className="curriculum-editor__add" onSubmit={addModule}>
        <h3>سرفصل جدید</h3>
        <Field id="module-title" name="title" label="عنوان سرفصل" required />
        <Field id="module-summary" name="summary" label="خلاصه سرفصل" />
        <Field
          id="module-order"
          name="sortOrder"
          label="ترتیب"
          type="number"
          defaultValue={String(course.modules.length + 1)}
        />
        <Button type="submit" disabled={loading}>
          افزودن سرفصل
        </Button>
      </form>
    </section>
  );
}

function LessonFields({
  idPrefix,
  title,
  summary,
  sortOrder,
  minutes,
  isPreview,
  video,
}: {
  idPrefix: string;
  title: string;
  summary: string;
  sortOrder: string;
  minutes: string;
  isPreview: boolean;
  video: string;
}) {
  return (
    <>
      <Field id={`${idPrefix}-title`} name="title" label="عنوان جلسه" defaultValue={title} required />
      <Field id={`${idPrefix}-summary`} name="summary" label="خلاصه" defaultValue={summary} />
      <Field id={`${idPrefix}-order`} name="sortOrder" label="ترتیب" type="number" defaultValue={sortOrder} />
      <Field
        id={`${idPrefix}-minutes`}
        name="durationMinutes"
        label="دقیقه"
        type="number"
        min={0}
        defaultValue={minutes}
      />
      <label className="editor-check">
        <input type="checkbox" name="isPreview" defaultChecked={isPreview} />
        <span>پیش‌نمایش عمومی (روی سایت برچسب می‌خورد و ویدیوی سایت مجاز است)</span>
      </label>
      <VideoSource inputId={`${idPrefix}-video`} initial={video} />
      <p className="admin-page__hint">
        ویدیوی سایت اختیاری است. برای دوره‌های اسپات‌پلیر فقط جلسات پیش‌نمایش روی سایت پخش
        می‌شوند؛ بقیه فقط در اسپات‌پلیر دیده می‌شوند.
      </p>
    </>
  );
}

function VideoSource({ inputId, initial }: { inputId: string; initial: string }) {
  const [link, setLink] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function upload(file: File) {
    if (file.size <= 0 || file.size > MAX_VIDEO_BYTES) {
      setNote("حجم ویدیو باید کمتر از ۱۵۰ مگابایت باشد.");
      return;
    }
    const body = new FormData();
    body.set("file", file);
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/admin/uploads/lesson-video", {
        method: "POST",
        body,
      });
      const data = (await res.json()) as { url?: string; message?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.message || "بارگذاری ویدیو ناموفق بود.");
      }
      setLink(data.url);
      setNote("فایل بارگذاری شد. ذخیره جلسه را بزنید تا روی سرفصل بنشیند.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "بارگذاری ویدیو ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="video-source">
      <label className="z-field" htmlFor={inputId}>
        <span className="z-field__label">ویدیوی سایت (اختیاری)</span>
        <input
          id={inputId}
          className="z-field__control"
          name="videoAsset"
          dir="ltr"
          value={link}
          placeholder="خالی بگذارید اگر فقط اسپات‌پلیر است — یا لینک mp4"
          onChange={(event) => setLink(event.target.value)}
        />
      </label>
      <label className="video-source__file">
        <span>{busy ? "در حال بارگذاری…" : "یا فایل mp4، webm یا ogg را بارگذاری کنید"}</span>
        <input
          type="file"
          accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.ogg"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void upload(file);
          }}
        />
      </label>
      {note ? <p className="admin-page__hint">{note}</p> : null}
    </div>
  );
}

function lessonPayload(data: FormData, moduleId: string) {
  const minutes = String(data.get("durationMinutes") || "").trim();
  return {
    moduleId,
    title: String(data.get("title") || "").trim(),
    summary: String(data.get("summary") || "").trim() || null,
    sortOrder: Number(data.get("sortOrder") || 0),
    durationMinutes: minutes ? Number(minutes) : null,
    isPreview: data.get("isPreview") === "on",
    videoAsset: String(data.get("videoAsset") || "").trim(),
  };
}
