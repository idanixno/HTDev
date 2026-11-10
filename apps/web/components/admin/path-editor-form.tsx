"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";
import { MarkdownEditor } from "./markdown-editor";

export type PathEditorInitial = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  coverAsset: string;
  published: boolean;
  sortOrder: string;
};

const EMPTY: PathEditorInitial = {
  slug: "",
  title: "",
  summary: "",
  description: "",
  coverAsset: "",
  published: false,
  sortOrder: "0",
};

export function PathEditorForm({
  pathId,
  initial,
}: {
  pathId?: string;
  initial?: Partial<PathEditorInitial>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<PathEditorInitial>({
    ...EMPTY,
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function patch(partial: Partial<PathEditorInitial>) {
    setValues((prev) => ({ ...prev, ...partial }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const saved = await authFetch<{ id: string }>(
        pathId ? `/api/admin/paths/${pathId}` : "/api/admin/paths",
        {
          method: pathId ? "PATCH" : "POST",
          body: JSON.stringify({
            slug: values.slug.trim(),
            title: values.title.trim(),
            summary: values.summary.trim() || null,
            description: values.description.trim() || null,
            coverAsset: values.coverAsset.trim() || null,
            published: values.published,
            sortOrder: Number(values.sortOrder || 0),
          }),
        },
      );
      router.push(`/admin/paths/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره مسیر ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  async function removePath() {
    if (!pathId) return;
    if (
      !window.confirm(
        "این مسیر و همهٔ گام‌هایش حذف شوند؟ این کار برگشت‌پذیر نیست.",
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authFetch(`/api/admin/paths/${pathId}`, { method: "DELETE" });
      router.push("/admin/paths");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف مسیر ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="editor-form" onSubmit={onSubmit}>
      {error ? (
        <Notice tone="error" title="ذخیره نشد">
          {error}
        </Notice>
      ) : null}
      <div className="editor-form__grid">
        <Field
          id="path-title"
          label="عنوان"
          value={values.title}
          onChange={(e) => patch({ title: e.target.value })}
          required
        />
        <Field
          id="path-slug"
          label="اسلاگ"
          mono
          dir="ltr"
          value={values.slug}
          onChange={(e) => patch({ slug: e.target.value })}
          required
        />
        <Field
          id="path-summary"
          label="خلاصه"
          className="editor-form__wide"
          value={values.summary}
          onChange={(e) => patch({ summary: e.target.value })}
        />
        <MarkdownEditor
          id="path-description"
          label="توضیح"
          variant="basic"
          rows={6}
          value={values.description}
          onChange={(description) => patch({ description })}
        />
        <Field
          id="path-cover"
          label="تصویر کاور"
          mono
          dir="ltr"
          value={values.coverAsset}
          onChange={(e) => patch({ coverAsset: e.target.value })}
        />
        <Field
          id="path-sort"
          label="ترتیب"
          type="number"
          value={values.sortOrder}
          onChange={(e) => patch({ sortOrder: e.target.value })}
        />
        <label className="editor-check">
          <input
            type="checkbox"
            checked={values.published}
            onChange={(e) => patch({ published: e.target.checked })}
          />
          <span>منتشر شود</span>
        </label>
      </div>
      <div className="editor-form__actions">
        <Button type="submit" loading={loading}>
          {pathId ? "ذخیره مسیر" : "ایجاد مسیر"}
        </Button>
        <Button href="/admin/paths" variant="secondary">
          بازگشت
        </Button>
        {pathId ? (
          <Button
            type="button"
            variant="danger"
            loading={loading}
            onClick={removePath}
          >
            حذف مسیر
          </Button>
        ) : null}
      </div>
    </form>
  );
}
