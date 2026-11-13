"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";
import { AssetImageField } from "./asset-image-field";
import { MarkdownEditor } from "./markdown-editor";
import { SeoAssistantPanel } from "./seo-assistant-panel";

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
  previewAsset: string;
  indexLabel: string;
  diagramKind: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  noIndex: boolean;
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
  previewAsset: "",
  indexLabel: "",
  diagramKind: "BOUNDARY",
  seoTitle: "",
  seoDescription: "",
  ogImage: "",
  noIndex: false,
};

const MAX_VIDEO_BYTES = 150 * 1024 * 1024;

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
  const [values, setValues] = useState<CourseEditorInitial>({
    ...EMPTY,
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoBusy, setVideoBusy] = useState(false);
  const [videoNote, setVideoNote] = useState<string | null>(null);

  const seoValues = useMemo(
    () => ({
      entityType: "COURSE" as const,
      entityId: courseId,
      title: values.title,
      slug: values.slug,
      seoTitle: values.seoTitle,
      seoDescription: values.seoDescription,
      summary: values.summary,
      body: values.description,
      coverAsset: values.coverAsset,
      ogImage: values.ogImage,
      noIndex: values.noIndex,
      published: values.publicationStatus === "PUBLISHED",
    }),
    [courseId, values],
  );

  function patch(partial: Partial<CourseEditorInitial>) {
    setValues((prev) => ({ ...prev, ...partial }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const offerKind = values.offerKind;
    const priceToman = Number(values.priceToman || 0);
    const compareRaw = values.compareAtToman.trim();
    const durationRaw = values.durationHours.trim();
    const body = {
      slug: values.slug.trim(),
      title: values.title.trim(),
      summary: values.summary.trim() || null,
      description: values.description.trim() || null,
      categoryId: values.categoryId || null,
      publicationStatus: values.publicationStatus,
      offerKind,
      priceToman: offerKind === "FREE" ? 0 : priceToman,
      compareAtToman: compareRaw ? Number(compareRaw) : null,
      levelLabel: values.levelLabel.trim() || null,
      durationHours: durationRaw ? Number(durationRaw) : null,
      featured: values.featured,
      sortOrder: Number(values.sortOrder || 0),
      coverAsset: values.coverAsset.trim() || null,
      previewAsset: values.previewAsset.trim() || null,
      indexLabel: values.indexLabel.trim() || null,
      diagramKind: values.diagramKind || "BOUNDARY",
      seoTitle: values.seoTitle.trim() || null,
      seoDescription: values.seoDescription.trim() || null,
      ogImage: values.ogImage.trim() || null,
      noIndex: values.noIndex,
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

  async function removeCourse() {
    if (!courseId) return;
    if (!window.confirm("این دوره حذف شود؟ اگر سفارش داشته باشد حذف نمی‌شود."))
      return;
    setError(null);
    setLoading(true);
    try {
      await authFetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
      router.push("/admin/courses");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف دوره ناموفق بود.");
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
          id="course-title"
          name="title"
          label="عنوان"
          value={values.title}
          onChange={(e) => patch({ title: e.target.value })}
          required
        />
        <Field
          id="course-slug"
          name="slug"
          label="اسلاگ"
          mono
          dir="ltr"
          value={values.slug}
          onChange={(e) => patch({ slug: e.target.value })}
          required
        />
        <Field
          id="course-summary"
          name="summary"
          label="خلاصه"
          value={values.summary}
          onChange={(e) => patch({ summary: e.target.value })}
        />
        <MarkdownEditor
          id="course-description"
          name="description"
          label="توضیح"
          variant="full"
          rows={12}
          value={values.description}
          onChange={(description) => patch({ description })}
        />
        <div className="editor-form__wide editor-seo-row">
          <fieldset className="editor-seo">
            <legend>سئو</legend>
            <Field
              id="course-seo-title"
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
                value={values.seoDescription}
                onChange={(e) => patch({ seoDescription: e.target.value })}
                rows={3}
                maxLength={320}
              />
            </label>
            <Field
              id="course-og"
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
              const next: Partial<CourseEditorInitial> = {};
              if (partial.title != null) next.title = partial.title;
              if (partial.slug != null) next.slug = partial.slug;
              if (partial.seoTitle != null) next.seoTitle = partial.seoTitle;
              if (partial.seoDescription != null)
                next.seoDescription = partial.seoDescription;
              if (partial.summary != null) next.summary = partial.summary;
              if (partial.body != null) next.description = partial.body;
              patch(next);
            }}
          />
        </div>
          <label className="z-field">
            <span className="z-field__label">دسته</span>
            <select
              className="z-field__control"
              name="categoryId"
              value={values.categoryId}
              onChange={(e) => patch({ categoryId: e.target.value })}
            >
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
              value={values.publicationStatus}
              onChange={(e) => patch({ publicationStatus: e.target.value })}
            >
              <option value="DRAFT">پیش‌نویس</option>
              <option value="PUBLISHED">منتشرشده</option>
              <option value="UNPUBLISHED">برداشته‌شده</option>
              <option value="ARCHIVED">بایگانی</option>
            </select>
          </label>
          <label className="z-field">
            <span className="z-field__label">نوع پیشنهاد</span>
            <select
              className="z-field__control"
              name="offerKind"
              value={values.offerKind}
              onChange={(e) => patch({ offerKind: e.target.value })}
            >
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
            value={values.priceToman}
            onChange={(e) => patch({ priceToman: e.target.value })}
          />
          <Field
            id="course-compare"
            name="compareAtToman"
            label="قیمت قبل از تخفیف"
            type="number"
            min={0}
            value={values.compareAtToman}
            onChange={(e) => patch({ compareAtToman: e.target.value })}
          />
          <Field
            id="course-level"
            name="levelLabel"
            label="سطح"
            value={values.levelLabel}
            onChange={(e) => patch({ levelLabel: e.target.value })}
            placeholder="مقدماتی، میانی، پیشرفته"
          />
          <Field
            id="course-hours"
            name="durationHours"
            label="مدت (ساعت)"
            type="number"
            min={0}
            step="0.5"
            value={values.durationHours}
            onChange={(e) => patch({ durationHours: e.target.value })}
          />
          <Field
            id="course-sort"
            name="sortOrder"
            label="ترتیب"
            type="number"
            value={values.sortOrder}
            onChange={(e) => patch({ sortOrder: e.target.value })}
          />
          <AssetImageField
            id="course-cover"
            name="coverAsset"
            label="تصویر جلد"
            className="editor-form__wide"
            value={values.coverAsset}
            placeholder="/artwork/courses/… یا آپلود"
            disabled={loading}
            onChange={(coverAsset) => patch({ coverAsset })}
          />
          <div className="video-source editor-form__wide">
            <label className="z-field" htmlFor="course-preview">
              <span className="z-field__label">ویدیوی معرفی / پیش‌نمایش</span>
              <input
                id="course-preview"
                className="z-field__control"
                name="previewAsset"
                dir="ltr"
                value={values.previewAsset}
                placeholder="https://…/intro.mp4 یا /media/lessons/…"
                onChange={(e) => patch({ previewAsset: e.target.value })}
              />
            </label>
            <label className="video-source__file">
              <span>
                {videoBusy
                  ? "در حال بارگذاری…"
                  : "یا فایل mp4، webm یا ogg را بارگذاری کنید"}
              </span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.ogg"
                disabled={videoBusy || loading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  if (file.size <= 0 || file.size > MAX_VIDEO_BYTES) {
                    setVideoNote("حجم ویدیو باید کمتر از ۱۵۰ مگابایت باشد.");
                    return;
                  }
                  const body = new FormData();
                  body.set("file", file);
                  setVideoBusy(true);
                  setVideoNote(null);
                  void (async () => {
                    try {
                      const res = await fetch(
                        "/api/admin/uploads/lesson-video",
                        { method: "POST", body },
                      );
                      const data = (await res.json()) as {
                        url?: string;
                        message?: string;
                      };
                      if (!res.ok || !data.url) {
                        throw new Error(
                          data.message || "بارگذاری ویدیو ناموفق بود.",
                        );
                      }
                      patch({ previewAsset: data.url });
                      setVideoNote(
                        "فایل بارگذاری شد. ذخیره دوره را بزنید تا روی هیرو بنشیند.",
                      );
                    } catch (err) {
                      setVideoNote(
                        err instanceof Error
                          ? err.message
                          : "بارگذاری ویدیو ناموفق بود.",
                      );
                    } finally {
                      setVideoBusy(false);
                    }
                  })();
                }}
              />
            </label>
            {videoNote ? <p className="admin-page__hint">{videoNote}</p> : null}
            <p className="admin-page__hint">
              اگر پر باشد، در صفحهٔ دوره به‌جای تصویر جلد پخش می‌شود؛ تصویر جلد به‌عنوان پوستر
              ویدیو می‌ماند.
            </p>
          </div>
          <Field
            id="course-index"
            name="indexLabel"
            label="برچسب شاخص کارت"
            value={values.indexLabel}
            onChange={(e) => patch({ indexLabel: e.target.value })}
          />
          <label className="z-field">
            <span className="z-field__label">نمودار کارت</span>
            <select
              className="z-field__control"
              name="diagramKind"
              value={values.diagramKind}
              onChange={(e) => patch({ diagramKind: e.target.value })}
            >
              <option value="BOUNDARY">مرز</option>
              <option value="CHAIN">زنجیره</option>
            </select>
          </label>
          <label className="editor-check">
            <input
              type="checkbox"
              name="featured"
              checked={values.featured}
              onChange={(e) => patch({ featured: e.target.checked })}
            />
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
        {courseId ? (
          <Button
            type="button"
            variant="danger"
            disabled={loading}
            onClick={() => void removeCourse()}
          >
            حذف دوره
          </Button>
        ) : null}
      </div>
    </form>
  );
}
