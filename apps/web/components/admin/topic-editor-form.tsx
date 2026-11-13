"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";

type Option = { id: string; label: string; slug?: string };

export function TopicEditorForm({
  topicId,
  initial,
  parentOptions,
  courseOptions,
  articleOptions,
  relationOptions,
  existingRelations,
}: {
  topicId?: string;
  initial?: {
    name: string;
    slug: string;
    description: string;
    introContent: string;
    seoTitle: string;
    seoDescription: string;
    h1: string;
    parentTopicId: string;
    canonicalUrl: string;
    indexable: boolean;
    status: string;
    sortOrder: string;
    courseIds: string[];
    articleIds: string[];
  };
  parentOptions: Option[];
  courseOptions: Option[];
  articleOptions: Option[];
  relationOptions: Option[];
  existingRelations?: Array<{
    id: string;
    relationType: string;
    toTopic: { id: string; name: string; slug: string };
  }>;
}) {
  const router = useRouter();
  const values = {
    name: "",
    slug: "",
    description: "",
    introContent: "",
    seoTitle: "",
    seoDescription: "",
    h1: "",
    parentTopicId: "",
    canonicalUrl: "",
    indexable: true,
    status: "DRAFT",
    sortOrder: "0",
    courseIds: [] as string[],
    articleIds: [] as string[],
    ...initial,
  };
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [courseIds, setCourseIds] = useState<string[]>(values.courseIds);
  const [articleIds, setArticleIds] = useState<string[]>(values.articleIds);
  const [relateToId, setRelateToId] = useState("");
  const [relations, setRelations] = useState(existingRelations ?? []);

  const parents = useMemo(
    () => parentOptions.filter((p) => p.id !== topicId),
    [parentOptions, topicId],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: String(form.get("name") || "").trim(),
        slug: String(form.get("slug") || "").trim().toLowerCase(),
        description: String(form.get("description") || "").trim() || null,
        introContent: String(form.get("introContent") || "").trim() || null,
        seoTitle: String(form.get("seoTitle") || "").trim() || null,
        seoDescription: String(form.get("seoDescription") || "").trim() || null,
        h1: String(form.get("h1") || "").trim() || null,
        parentTopicId: String(form.get("parentTopicId") || "").trim() || null,
        canonicalUrl: String(form.get("canonicalUrl") || "").trim() || null,
        indexable: form.get("indexable") === "on",
        status: String(form.get("status") || "DRAFT"),
        sortOrder: Number(form.get("sortOrder") || 0),
        courseIds,
        articleIds,
      };
      const saved = await authFetch<{ id: string }>(
        topicId ? `/api/admin/topics/${topicId}` : "/api/admin/topics",
        {
          method: topicId ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );
      router.push(`/admin/topics/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره موضوع ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  async function removeTopic() {
    if (!topicId) return;
    if (
      !window.confirm(
        "این موضوع حذف شود؟ دوره‌ها و مقالات حذف نمی‌شوند؛ فقط ارتباط‌ها قطع می‌شوند.",
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authFetch(`/api/admin/topics/${topicId}`, { method: "DELETE" });
      router.push("/admin/topics");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف موضوع ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  async function addRelation() {
    if (!topicId || !relateToId) return;
    setLoading(true);
    setError(null);
    try {
      const created = await authFetch<{
        id: string;
        relationType: string;
        toTopicId: string;
      }>(`/api/admin/topics/${topicId}/relations`, {
        method: "POST",
        body: JSON.stringify({ toTopicId: relateToId, relationType: "RELATED" }),
      });
      const option = relationOptions.find((o) => o.id === relateToId);
      setRelations((prev) => [
        ...prev,
        {
          id: created.id,
          relationType: created.relationType,
          toTopic: {
            id: relateToId,
            name: option?.label ?? relateToId,
            slug: option?.slug ?? "",
          },
        },
      ]);
      setRelateToId("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "افزودن ارتباط ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  async function removeRelation(relationId: string) {
    setLoading(true);
    setError(null);
    try {
      await authFetch(`/api/admin/topic-relations/${relationId}`, {
        method: "DELETE",
      });
      setRelations((prev) => prev.filter((r) => r.id !== relationId));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف ارتباط ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  function toggleId(
    list: string[],
    setList: (next: string[]) => void,
    id: string,
  ) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
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
          id="topic-name"
          name="name"
          label="نام"
          defaultValue={values.name}
          required
        />
        <Field
          id="topic-slug"
          name="slug"
          label="اسلاگ"
          mono
          dir="ltr"
          defaultValue={values.slug}
          required
        />
        <Field
          id="topic-h1"
          name="h1"
          label="H1 (اختیاری)"
          defaultValue={values.h1}
        />
        <label className="field">
          <span className="field__label">وضعیت</span>
          <select
            name="status"
            className="field__control"
            defaultValue={values.status}
          >
            <option value="DRAFT">پیش‌نویس</option>
            <option value="PUBLISHED">منتشرشده</option>
            <option value="ARCHIVED">بایگانی</option>
          </select>
        </label>
        <label className="field">
          <span className="field__label">والد</span>
          <select
            name="parentTopicId"
            className="field__control"
            defaultValue={values.parentTopicId}
          >
            <option value="">— بدون والد —</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <Field
          id="topic-sort"
          name="sortOrder"
          label="ترتیب"
          type="number"
          defaultValue={values.sortOrder}
        />
        <Field
          id="topic-canonical"
          name="canonicalUrl"
          label="Canonical (اختیاری)"
          mono
          dir="ltr"
          defaultValue={values.canonicalUrl}
        />
        <label className="field field--checkbox">
          <input
            type="checkbox"
            name="indexable"
            defaultChecked={values.indexable}
          />
          <span>قابل ایندکس (indexable)</span>
        </label>
      </div>

      <Field
        id="topic-description"
        name="description"
        label="توضیح کوتاه"
        defaultValue={values.description}
      />
      <label className="field">
        <span className="field__label">محتوای معرفی (Markdown)</span>
        <textarea
          name="introContent"
          className="field__control"
          rows={10}
          defaultValue={values.introContent}
          dir="rtl"
        />
      </label>

      <div className="editor-form__grid">
        <Field
          id="topic-seo-title"
          name="seoTitle"
          label="SEO Title"
          defaultValue={values.seoTitle}
        />
        <Field
          id="topic-seo-desc"
          name="seoDescription"
          label="SEO Description"
          defaultValue={values.seoDescription}
        />
      </div>

      <fieldset className="editor-form__fieldset">
        <legend>دوره‌های مرتبط</legend>
        <div className="editor-form__checklist">
          {courseOptions.map((course) => (
            <label key={course.id} className="field field--checkbox">
              <input
                type="checkbox"
                checked={courseIds.includes(course.id)}
                onChange={() => toggleId(courseIds, setCourseIds, course.id)}
              />
              <span>{course.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="editor-form__fieldset">
        <legend>مقالات مرتبط</legend>
        <div className="editor-form__checklist">
          {articleOptions.map((article) => (
            <label key={article.id} className="field field--checkbox">
              <input
                type="checkbox"
                checked={articleIds.includes(article.id)}
                onChange={() => toggleId(articleIds, setArticleIds, article.id)}
              />
              <span>{article.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {topicId ? (
        <fieldset className="editor-form__fieldset">
          <legend>موضوعات مرتبط (RELATED)</legend>
          <ul className="editor-form__list">
            {relations.map((rel) => (
              <li key={rel.id}>
                <span>
                  {rel.toTopic.name}{" "}
                  <code dir="ltr">{rel.relationType}</code>
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void removeRelation(rel.id)}
                  disabled={loading}
                >
                  حذف
                </Button>
              </li>
            ))}
          </ul>
          <div className="editor-form__inline">
            <select
              className="field__control"
              value={relateToId}
              onChange={(e) => setRelateToId(e.target.value)}
            >
              <option value="">— انتخاب موضوع —</option>
              {relationOptions
                .filter(
                  (o) =>
                    o.id !== topicId &&
                    !relations.some((r) => r.toTopic.id === o.id),
                )
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
            </select>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void addRelation()}
              disabled={loading || !relateToId}
            >
              افزودن ارتباط
            </Button>
          </div>
        </fieldset>
      ) : null}

      <div className="editor-form__actions">
        <Button type="submit" loading={loading}>
          {topicId ? "ذخیره موضوع" : "ایجاد موضوع"}
        </Button>
        <Button href="/admin/topics" variant="secondary">
          بازگشت
        </Button>
        {topicId ? (
          <>
            <Button href={`/topics/${values.slug}`} variant="secondary">
              پیش‌نمایش عمومی
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void removeTopic()}
              disabled={loading}
            >
              حذف
            </Button>
          </>
        ) : null}
      </div>
    </form>
  );
}
