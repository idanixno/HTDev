"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";

export type CourseNoteRow = {
  id: string;
  body: string;
  courseId: string | null;
  sortOrder: number;
  published: boolean;
  scope: "global" | "course";
};

type Draft = {
  body: string;
  sortOrder: string;
  published: boolean;
};

const EMPTY: Draft = { body: "", sortOrder: "0", published: true };

export function CourseNotesEditor({
  courseId = null,
  title,
  hint,
}: {
  /** `null` → global notes for all courses. */
  courseId?: string | null;
  title: string;
  hint?: string;
}) {
  const scope = courseId ? "course" : "global";
  const [notes, setNotes] = useState<CourseNoteRow[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  async function load() {
    setBooting(true);
    setError(null);
    try {
      const qs = courseId
        ? `?scope=course&courseId=${encodeURIComponent(courseId)}`
        : "?scope=global";
      const rows = await authFetch<CourseNoteRow[]>(
        `/api/admin/cms/course-notes${qs}`,
      );
      setNotes(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خواندن نکات ناموفق بود.");
    } finally {
      setBooting(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  function startEdit(note: CourseNoteRow) {
    setEditingId(note.id);
    setDraft({
      body: note.body,
      sortOrder: String(note.sortOrder),
      published: note.published,
    });
    setError(null);
  }

  function resetDraft() {
    setEditingId(null);
    setDraft(EMPTY);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        body: draft.body.trim(),
        sortOrder: Number(draft.sortOrder || 0),
        published: draft.published,
        courseId: courseId ?? null,
      };
      if (editingId) {
        await authFetch(`/api/admin/cms/course-notes/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await authFetch("/api/admin/cms/course-notes", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      resetDraft();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره نکته ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  async function removeNote(id: string) {
    if (!window.confirm("این نکته حذف شود؟")) return;
    setLoading(true);
    setError(null);
    try {
      await authFetch(`/api/admin/cms/course-notes/${id}`, {
        method: "DELETE",
      });
      if (editingId === id) resetDraft();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف نکته ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="course-notes-editor">
      <header className="course-notes-editor__head">
        <div>
          <h2>{title}</h2>
          {hint ? <p className="admin-page__subtitle">{hint}</p> : null}
        </div>
        <span className="course-notes-editor__scope" data-scope={scope}>
          {scope === "global" ? "عمومی · همه دوره‌ها" : "انحصاری · این دوره"}
        </span>
      </header>

      {error ? (
        <Notice tone="error" title="خطا">
          {error}
        </Notice>
      ) : null}

      {booting ? (
        <p className="admin-table__muted">در حال بارگذاری…</p>
      ) : notes.length === 0 ? (
        <Notice tone="information" title="خالی">
          هنوز نکته‌ای ثبت نشده.
        </Notice>
      ) : (
        <ul className="course-notes-editor__list">
          {notes.map((note) => (
            <li key={note.id}>
              <div>
                <p>{note.body}</p>
                <p className="admin-table__muted">
                  ترتیب {note.sortOrder.toLocaleString("fa-IR")}
                  {" · "}
                  {note.published ? "منتشر" : "پیش‌نویس"}
                </p>
              </div>
              <div className="course-notes-editor__row-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => startEdit(note)}
                  disabled={loading}
                >
                  ویرایش
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => void removeNote(note.id)}
                  disabled={loading}
                >
                  حذف
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="editor-form course-notes-editor__form" onSubmit={onSubmit}>
        <h3>{editingId ? "ویرایش نکته" : "نکتهٔ جدید"}</h3>
        <label className="z-field editor-form__wide" htmlFor={`note-body-${scope}`}>
          <span className="z-field__label">متن نکته</span>
          <textarea
            id={`note-body-${scope}`}
            name="body"
            className="z-field__control"
            rows={3}
            value={draft.body}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            required
            maxLength={1000}
          />
          <span className="z-field__hint">
            برای درج لینک، از قالب [عنوان](https://example.com) استفاده کنید.
          </span>
        </label>
        <div className="editor-form__grid">
          <Field
            id={`note-sort-${scope}`}
            name="sortOrder"
            label="ترتیب"
            value={draft.sortOrder}
            onChange={(e) =>
              setDraft((d) => ({ ...d, sortOrder: e.target.value }))
            }
          />
          <label className="editor-check">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) =>
                setDraft((d) => ({ ...d, published: e.target.checked }))
              }
            />
            منتشر شود
          </label>
        </div>
        <div className="editor-form__actions">
          <Button type="submit" loading={loading}>
            {editingId ? "ذخیره تغییرات" : "افزودن نکته"}
          </Button>
          {editingId ? (
            <Button type="button" variant="secondary" onClick={resetDraft}>
              انصراف
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
