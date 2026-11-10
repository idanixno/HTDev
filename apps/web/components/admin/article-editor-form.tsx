"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";
import { MarkdownEditor } from "./markdown-editor";
import { SeoAssistantPanel } from "./seo-assistant-panel";

export type ArticleEditorInitial = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  coverAsset: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  noIndex: boolean;
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
  seoTitle: "",
  seoDescription: "",
  ogImage: "",
  noIndex: false,
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
  const [values, setValues] = useState<ArticleEditorInitial>({
    ...EMPTY,
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const seoValues = useMemo(
    () => ({
      entityType: "ARTICLE" as const,
      entityId: articleId,
      title: values.title,
      slug: values.slug,
      seoTitle: values.seoTitle,
      seoDescription: values.seoDescription,
      summary: values.summary,
      body: values.body,
      coverAsset: values.coverAsset,
      ogImage: values.ogImage,
      noIndex: values.noIndex,
      published: values.published,
    }),
    [articleId, values],
  );

  function patch(partial: Partial<ArticleEditorInitial>) {
    setValues((prev) => ({ ...prev, ...partial }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const minutes = values.readingMinutes.trim();
    setLoading(true);
    setError(null);
    try {
      const saved = await authFetch<{ id: string }>(
        articleId ? `/api/admin/articles/${articleId}` : "/api/admin/articles",
        {
          method: articleId ? "PATCH" : "POST",
          body: JSON.stringify({
            slug: values.slug.trim(),
            title: values.title.trim(),
            summary: values.summary.trim() || null,
            body: values.body.trim(),
            coverAsset: values.coverAsset.trim() || null,
            seoTitle: values.seoTitle.trim() || null,
            seoDescription: values.seoDescription.trim() || null,
            ogImage: values.ogImage.trim() || null,
            noIndex: values.noIndex,
            published: values.published,
            readingMinutes: minutes ? Number(minutes) : null,
            sortOrder: Number(values.sortOrder || 0),
          }),
        },
      );
      router.push(`/admin/journal/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره مقاله ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  async function removeArticle() {
    if (!articleId) return;
    if (!window.confirm("این مقاله حذف شود؟")) return;
    setLoading(true);
    setError(null);
    try {
      await authFetch(`/api/admin/articles/${articleId}`, { method: "DELETE" });
      router.push("/admin/journal");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف مقاله ناموفق بود.");
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
          id="article-title"
          name="title"
          label="عنوان"
          value={values.title}
          onChange={(e) => patch({ title: e.target.value })}
          required
        />
        <Field
          id="article-slug"
          name="slug"
          label="اسلاگ"
          mono
          dir="ltr"
          value={values.slug}
          onChange={(e) => patch({ slug: e.target.value })}
          required
        />
        <Field
          id="article-summary"
          name="summary"
          label="خلاصه"
          className="editor-form__wide"
          value={values.summary}
          onChange={(e) => patch({ summary: e.target.value })}
        />
        <MarkdownEditor
          id="article-body"
          name="body"
          label="متن"
          required
          minLength={20}
          maxLength={60000}
          rows={16}
          value={values.body}
          onChange={(body) => patch({ body })}
          hint="از نوار ابزار برای بولد، لینک، عکس، ویدیو، جدول و پرسش‌وپاسخ استفاده کنید. خروجی مارک‌داون ژرفا است."
        />
        <div className="editor-form__wide editor-seo-row">
          <fieldset className="editor-seo">
            <legend>سئو</legend>
            <Field
              id="article-seo-title"
              name="seoTitle"
              label="عنوان سئو"
              value={values.seoTitle}
              onChange={(e) => patch({ seoTitle: e.target.value })}
            />
            <label className="z-field">
              <span className="z-field__label">توضیح سئو</span>
              <textarea
                className="z-field__control"
                name="seoDescription"
                rows={3}
                maxLength={320}
                value={values.seoDescription}
                onChange={(e) => patch({ seoDescription: e.target.value })}
              />
            </label>
            <Field
              id="article-og"
              name="ogImage"
              label="تصویر اشتراک‌گذاری"
              mono
              dir="ltr"
              value={values.ogImage}
              onChange={(e) => patch({ ogImage: e.target.value })}
            />
            <label className="editor-check">
              <input
                type="checkbox"
                name="noIndex"
                checked={values.noIndex}
                onChange={(e) => patch({ noIndex: e.target.checked })}
              />
              <span>در موتور جستجو ایندکس نشود</span>
            </label>
          </fieldset>
          <SeoAssistantPanel
            values={seoValues}
            onApply={(partial) => {
              const next: Partial<ArticleEditorInitial> = {};
              if (partial.title != null) next.title = partial.title;
              if (partial.slug != null) next.slug = partial.slug;
              if (partial.seoTitle != null) next.seoTitle = partial.seoTitle;
              if (partial.seoDescription != null)
                next.seoDescription = partial.seoDescription;
              if (partial.summary != null) next.summary = partial.summary;
              if (partial.body != null) next.body = partial.body;
              patch(next);
            }}
          />
        </div>
        <Field
          id="article-cover"
          name="coverAsset"
          label="تصویر"
          mono
          dir="ltr"
          value={values.coverAsset}
          onChange={(e) => patch({ coverAsset: e.target.value })}
        />
        <Field
          id="article-minutes"
          name="readingMinutes"
          label="زمان مطالعه (دقیقه)"
          type="number"
          min={1}
          value={values.readingMinutes}
          onChange={(e) => patch({ readingMinutes: e.target.value })}
        />
        <Field
          id="article-sort"
          name="sortOrder"
          label="ترتیب"
          type="number"
          value={values.sortOrder}
          onChange={(e) => patch({ sortOrder: e.target.value })}
        />
        <label className="editor-check">
          <input
            type="checkbox"
            name="published"
            checked={values.published}
            onChange={(e) => patch({ published: e.target.checked })}
          />
          <span>منتشر شود</span>
        </label>
      </div>
      <div className="editor-form__actions">
        <Button type="submit" loading={loading}>
          {articleId ? "ذخیره مقاله" : "ایجاد مقاله"}
        </Button>
        <Button href="/admin/journal" variant="secondary">
          بازگشت
        </Button>
        {articleId ? (
          <Button
            type="button"
            variant="danger"
            loading={loading}
            onClick={removeArticle}
          >
            حذف مقاله
          </Button>
        ) : null}
      </div>
    </form>
  );
}
