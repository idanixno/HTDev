"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";

export type ArticleEditorInitial = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  coverAsset: string;
  published: boolean;
  readingMinutes: string;
  sortOrder: string;
};

const EMPTY: ArticleEditorInitial = {
  slug: "",
  title: "",
  summary: "",
  body: "",
  coverAsset: "",
  published: false,
  readingMinutes: "",
  sortOrder: "0",
};

export function ArticleEditorForm({
  articleId,
  initial,
}: {
  articleId?: string;
  initial?: Partial<ArticleEditorInitial>;
}) {
  const router = useRouter();
  const values = { ...EMPTY, ...initial };
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const minutes = String(form.get("readingMinutes") || "").trim();
    setLoading(true);
    setError(null);
    try {
      const saved = await authFetch<{ id: string }>(
        articleId ? `/api/admin/articles/${articleId}` : "/api/admin/articles",
        {
          method: articleId ? "PATCH" : "POST",
          body: JSON.stringify({
            slug: String(form.get("slug") || "").trim(),
            title: String(form.get("title") || "").trim(),
            summary: String(form.get("summary") || "").trim() || null,
            body: String(form.get("body") || "").trim(),
            coverAsset: String(form.get("coverAsset") || "").trim() || null,
            published: form.get("published") === "on",
            readingMinutes: minutes ? Number(minutes) : null,
            sortOrder: Number(form.get("sortOrder") || 0),
          }),
        },
      );
      router.push(`/admin/journal/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره یادداشت ناموفق بود.");
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
        <Field id="article-title" name="title" label="عنوان" defaultValue={values.title} required />
        <Field
          id="article-slug"
          name="slug"
          label="اسلاگ"
          mono
          dir="ltr"
          defaultValue={values.slug}
          required
        />
        <Field
          id="article-summary"
          name="summary"
          label="خلاصه"
          className="editor-form__wide"
          defaultValue={values.summary}
        />
        <label className="z-field editor-form__wide">
          <span className="z-field__label">متن</span>
          <textarea
            className="z-field__control"
            name="body"
            required
            minLength={20}
            rows={14}
            defaultValue={values.body}
          />
          <span className="z-field__hint">
            پاراگراف‌ها را با یک خط خالی جدا کنید. عنوان فرعی با ## و کد با ``` .
          </span>
        </label>
        <Field
          id="article-cover"
          name="coverAsset"
          label="تصویر"
          mono
          dir="ltr"
          defaultValue={values.coverAsset}
        />
        <Field
          id="article-minutes"
          name="readingMinutes"
          label="زمان مطالعه (دقیقه)"
          type="number"
          min={1}
          defaultValue={values.readingMinutes}
        />
        <Field
          id="article-sort"
          name="sortOrder"
          label="ترتیب"
          type="number"
          defaultValue={values.sortOrder}
        />
        <label className="editor-check">
          <input type="checkbox" name="published" defaultChecked={values.published} />
          <span>منتشر شود</span>
        </label>
      </div>
      <div className="editor-form__actions">
        <Button type="submit" loading={loading}>
          {articleId ? "ذخیره یادداشت" : "ایجاد یادداشت"}
        </Button>
        <Button href="/admin/journal" variant="secondary">
          بازگشت
        </Button>
      </div>
    </form>
  );
}
