"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";

export function CategoryEditorForm({
  categoryId,
  initial,
}: {
  categoryId?: string;
  initial?: {
    slug: string;
    title: string;
    summary: string;
    sortOrder: string;
  };
}) {
  const router = useRouter();
  const values = {
    slug: "",
    title: "",
    summary: "",
    sortOrder: "0",
    ...initial,
  };
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);
    try {
      await authFetch(
        categoryId
          ? `/api/admin/categories/${categoryId}`
          : "/api/admin/categories",
        {
          method: categoryId ? "PATCH" : "POST",
          body: JSON.stringify({
            slug: String(form.get("slug") || "").trim(),
            title: String(form.get("title") || "").trim(),
            summary: String(form.get("summary") || "").trim() || null,
            sortOrder: Number(form.get("sortOrder") || 0),
          }),
        },
      );
      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره دسته ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  async function removeCategory() {
    if (!categoryId) return;
    if (
      !window.confirm(
        "این دسته حذف شود؟ دوره‌های مرتبط بدون دسته می‌مانند.",
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authFetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });
      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف دسته ناموفق بود.");
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
        <Field id="cat-title" name="title" label="عنوان" defaultValue={values.title} required />
        <Field
          id="cat-slug"
          name="slug"
          label="اسلاگ"
          mono
          dir="ltr"
          defaultValue={values.slug}
          required
        />
        <Field id="cat-summary" name="summary" label="خلاصه" defaultValue={values.summary} />
        <Field
          id="cat-sort"
          name="sortOrder"
          label="ترتیب"
          type="number"
          defaultValue={values.sortOrder}
        />
      </div>
      <div className="editor-form__actions">
        <Button type="submit" loading={loading}>
          {categoryId ? "ذخیره دسته" : "ایجاد دسته"}
        </Button>
        <Button href="/admin/categories" variant="secondary">
          بازگشت
        </Button>
        {categoryId ? (
          <Button
            type="button"
            variant="danger"
            loading={loading}
            onClick={removeCategory}
          >
            حذف دسته
          </Button>
        ) : null}
      </div>
    </form>
  );
}
