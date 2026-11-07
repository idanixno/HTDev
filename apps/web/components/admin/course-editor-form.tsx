"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";

type CategoryOption = { id: string; title: string };

export type CourseEditorInitial = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  categoryId: string;
  publicationStatus: string;
  offerKind: string;
  priceToman: string;
  compareAtToman: string;
  levelLabel: string;
  durationHours: string;
  featured: boolean;
  sortOrder: string;
  coverAsset: string;
  indexLabel: string;
  diagramKind: string;
};

const EMPTY: CourseEditorInitial = {
  slug: "",
  title: "",
  summary: "",
  description: "",
  categoryId: "",
  publicationStatus: "DRAFT",
  offerKind: "COMING_SOON",
  priceToman: "0",
  compareAtToman: "",
  levelLabel: "",
  durationHours: "",
  featured: false,
  sortOrder: "0",
  coverAsset: "",
  indexLabel: "",
  diagramKind: "BOUNDARY",
};

export function CourseEditorForm({
  courseId,
  initial,
  categories,
}: {
  courseId?: string;
  initial?: Partial<CourseEditorInitial>;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const values = { ...EMPTY, ...initial };
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const offerKind = String(form.get("offerKind"));
    const priceToman = Number(form.get("priceToman") || 0);
    const compareRaw = String(form.get("compareAtToman") || "").trim();
    const durationRaw = String(form.get("durationHours") || "").trim();
    const body = {
      slug: String(form.get("slug") || "").trim(),
      title: String(form.get("title") || "").trim(),
      summary: String(form.get("summary") || "").trim() || null,
      description: String(form.get("description") || "").trim() || null,
      categoryId: String(form.get("categoryId") || "") || null,
      publicationStatus: String(form.get("publicationStatus")),
      offerKind,
      priceToman: offerKind === "FREE" ? 0 : priceToman,
      compareAtToman: compareRaw ? Number(compareRaw) : null,
      levelLabel: String(form.get("levelLabel") || "").trim() || null,
      durationHours: durationRaw ? Number(durationRaw) : null,
      featured: form.get("featured") === "on",
      sortOrder: Number(form.get("sortOrder") || 0),
      coverAsset: String(form.get("coverAsset") || "").trim() || null,
      indexLabel: String(form.get("indexLabel") || "").trim() || null,
      diagramKind: String(form.get("diagramKind") || "BOUNDARY"),
    };

    setLoading(true);
    try {
      const saved = await authFetch<{ id: string }>(
        courseId ? `/api/admin/courses/${courseId}` : "/api/admin/courses",
        {
          method: courseId ? "PATCH" : "POST",
          body: JSON.stringify(body),
        },
      );
      router.push(`/admin/courses/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره دوره ناموفق بود.");
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
        <Field id="course-title" name="title" label="عنوان" defaultValue={values.title} required />
        <Field
          id="course-slug"
          name="slug"
          label="اسلاگ"
          mono
          dir="ltr"
          defaultValue={values.slug}
          required
        />
        <Field
          id="course-summary"
          name="summary"
          label="خلاصه"
          defaultValue={values.summary}
        />
        <label className="z-field editor-form__wide">
          <span className="z-field__label">توضیح</span>
          <textarea
            className="z-field__control"
            name="description"
            defaultValue={values.description}
            rows={6}
          />
        </label>
        <label className="z-field">
          <span className="z-field__label">دسته</span>
          <select className="z-field__control" name="categoryId" defaultValue={values.categoryId}>
            <option value="">بدون دسته</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </label>
        <label className="z-field">
          <span className="z-field__label">انتشار</span>
          <select
            className="z-field__control"
            name="publicationStatus"
            defaultValue={values.publicationStatus}
          >
            <option value="DRAFT">پیش‌نویس</option>
            <option value="PUBLISHED">منتشرشده</option>
            <option value="UNPUBLISHED">برداشته‌شده</option>
            <option value="ARCHIVED">بایگانی</option>
          </select>
        </label>
        <label className="z-field">
          <span className="z-field__label">نوع پیشنهاد</span>
          <select className="z-field__control" name="offerKind" defaultValue={values.offerKind}>
            <option value="PAID">پولی</option>
            <option value="FREE">رایگان</option>
            <option value="PRE_SALE">پیش‌فروش</option>
            <option value="COMING_SOON">به‌زودی</option>
          </select>
        </label>
        <Field
          id="course-price"
          name="priceToman"
          label="قیمت (تومان)"
          type="number"
          min={0}
          defaultValue={values.priceToman}
        />
        <Field
          id="course-compare"
          name="compareAtToman"
          label="قیمت قبل از تخفیف"
          type="number"
          min={0}
          defaultValue={values.compareAtToman}
        />
        <Field
          id="course-level"
          name="levelLabel"
          label="سطح"
          defaultValue={values.levelLabel}
          placeholder="مقدماتی، میانی، پیشرفته"
        />
        <Field
          id="course-hours"
          name="durationHours"
          label="مدت (ساعت)"
          type="number"
          min={0}
          step="0.5"
          defaultValue={values.durationHours}
        />
        <Field
          id="course-sort"
          name="sortOrder"
          label="ترتیب"
          type="number"
          defaultValue={values.sortOrder}
        />
        <Field
          id="course-cover"
          name="coverAsset"
          label="مسیر تصویر جلد"
          mono
          dir="ltr"
          defaultValue={values.coverAsset}
          placeholder="/artwork/courses/…"
        />
        <Field
          id="course-index"
          name="indexLabel"
          label="برچسب شاخص کارت"
          defaultValue={values.indexLabel}
        />
        <label className="z-field">
          <span className="z-field__label">نمودار کارت</span>
          <select className="z-field__control" name="diagramKind" defaultValue={values.diagramKind}>
            <option value="BOUNDARY">مرز</option>
            <option value="CHAIN">زنجیره</option>
          </select>
        </label>
        <label className="editor-check">
          <input type="checkbox" name="featured" defaultChecked={values.featured} />
          <span>نمایش در بخش ویژه صفحه اصلی</span>
        </label>
      </div>
      <div className="editor-form__actions">
        <Button type="submit" loading={loading}>
          {courseId ? "ذخیره تغییرات" : "ایجاد دوره"}
        </Button>
        <Button href="/admin/courses" variant="secondary">
          بازگشت به فهرست
        </Button>
      </div>
    </form>
  );
}
