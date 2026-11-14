"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";
import { MarkdownEditor } from "./markdown-editor";
import { SeoAssistantPanel } from "./seo-assistant-panel";

export type PathStepEditorInitial = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  noIndex: boolean;
  sortOrder: string;
  courseId: string;
};

const EMPTY: PathStepEditorInitial = {
  slug: "",
  title: "",
  summary: "",
  body: "",
  seoTitle: "",
  seoDescription: "",
  ogImage: "",
  noIndex: false,
  sortOrder: "",
  courseId: "",
};

export function PathStepEditorForm({
  pathId,
  stepId,
  initial,
  courseOptions,
}: {
  pathId: string;
  stepId?: string;
  initial?: Partial<PathStepEditorInitial>;
  courseOptions: Array<{
    id: string;
    title: string;
    slug: string;
    coverAsset: string | null;
  }>;
}) {
  const router = useRouter();
  const courseMenu = useRef<HTMLDetailsElement>(null);
  const [values, setValues] = useState<PathStepEditorInitial>({
    ...EMPTY,
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const seoValues = useMemo(
    () => ({
      entityType: "PATH_STEP" as const,
      entityId: stepId,
      title: values.title,
      slug: values.slug,
      seoTitle: values.seoTitle,
      seoDescription: values.seoDescription,
      summary: values.summary,
      body: values.body,
      coverAsset: "",
      ogImage: values.ogImage,
      noIndex: values.noIndex,
      published: true,
    }),
    [stepId, values],
  );

  function patch(partial: Partial<PathStepEditorInitial>) {
    setValues((prev) => ({ ...prev, ...partial }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const body = {
      slug: values.slug.trim(),
      title: values.title.trim(),
      summary: values.summary.trim() || null,
      body: values.body,
      seoTitle: values.seoTitle.trim() || null,
      seoDescription: values.seoDescription.trim() || null,
      ogImage: values.ogImage.trim() || null,
      noIndex: values.noIndex,
      ...(values.sortOrder.trim()
        ? { sortOrder: Number(values.sortOrder) }
        : {}),
      courseId: values.courseId || null,
    };
    try {
      const saved = await authFetch<{ id: string }>(
        stepId
          ? `/api/admin/paths/${pathId}/steps/${stepId}`
          : `/api/admin/paths/${pathId}/steps`,
        {
          method: stepId ? "PATCH" : "POST",
          body: JSON.stringify(body),
        },
      );
      router.push(`/admin/paths/${pathId}/steps/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیرهٔ گام ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  async function removeStep() {
    if (!stepId) return;
    if (!window.confirm("این گام حذف شود؟")) return;
    setLoading(true);
    setError(null);
    try {
      await authFetch(`/api/admin/paths/${pathId}/steps/${stepId}`, {
        method: "DELETE",
      });
      router.push(`/admin/paths/${pathId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف گام ناموفق بود.");
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
          id="step-title"
          name="title"
          label="عنوان"
          value={values.title}
          onChange={(e) => patch({ title: e.target.value })}
          required
        />
        <Field
          id="step-slug"
          name="slug"
          label="اسلاگ"
          mono
          dir="ltr"
          value={values.slug}
          onChange={(e) => patch({ slug: e.target.value })}
          required
        />
        <Field
          id="step-sort"
          name="sortOrder"
          label="ترتیب"
          type="number"
          value={values.sortOrder}
          onChange={(e) => patch({ sortOrder: e.target.value })}
        />
        <div className="z-field">
          <span className="z-field__label">دورهٔ وصل‌شده به این گام</span>
          <details className="path-step-course-picker" ref={courseMenu}>
            <summary className="path-step-course-picker__trigger">
              {values.courseId ? (
                (() => {
                  const selected = courseOptions.find(
                    (course) => course.id === values.courseId,
                  );
                  return selected ? (
                    <CourseOptionContent course={selected} />
                  ) : (
                    <span>دورهٔ انتخاب‌شده در فهرست نیست</span>
                  );
                })()
              ) : (
                <span>بدون دوره</span>
              )}
              <span className="path-step-course-picker__chevron" aria-hidden="true">
                ▾
              </span>
            </summary>
            <div className="path-step-course-picker__menu">
              <button
                type="button"
                className="path-step-course-picker__option"
                aria-pressed={!values.courseId}
                onClick={() => {
                  patch({ courseId: "" });
                  if (courseMenu.current) courseMenu.current.open = false;
                }}
              >
                <span className="path-step-course-picker__placeholder" aria-hidden="true">
                  —
                </span>
                <span>بدون دوره</span>
              </button>
              {courseOptions.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  className="path-step-course-picker__option"
                  aria-pressed={course.id === values.courseId}
                  onClick={() => {
                    patch({ courseId: course.id });
                    if (courseMenu.current) courseMenu.current.open = false;
                  }}
                >
                  <CourseOptionContent course={course} />
                </button>
              ))}
            </div>
          </details>
          <input type="hidden" name="courseId" value={values.courseId} />
        </div>
        <Field
          id="step-summary"
          name="summary"
          label="خلاصه"
          className="editor-form__wide"
          value={values.summary}
          onChange={(e) => patch({ summary: e.target.value })}
        />
        <MarkdownEditor
          id="step-body"
          name="body"
          label="متن"
          maxLength={60000}
          rows={18}
          value={values.body}
          onChange={(body) => patch({ body })}
          hint="عنوان فرم، h1 صفحه است. از نوار ابزار برای بولد، لینک، عکس، ویدیو، جدول، دوره و پرسش‌وپاسخ استفاده کنید."
        />
        <div className="editor-form__wide editor-seo-row">
          <fieldset className="editor-seo">
            <legend>سئو</legend>
            <Field
              id="step-seo-title"
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
              id="step-og"
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
              const next: Partial<PathStepEditorInitial> = {};
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
      </div>
      <div className="editor-form__actions">
        <Button type="submit" loading={loading}>
          {stepId ? "ذخیرهٔ گام" : "ایجاد گام"}
        </Button>
        <Button href={`/admin/paths/${pathId}`} variant="secondary">
          بازگشت
        </Button>
        {stepId ? (
          <Button
            type="button"
            variant="danger"
            loading={loading}
            onClick={removeStep}
          >
            حذف گام
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function CourseOptionContent({
  course,
}: {
  course: {
    title: string;
    slug: string;
    coverAsset: string | null;
  };
}) {
  const image = course.coverAsset ?? `/artwork/courses/${course.slug}.svg`;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="path-step-course-picker__image"
        src={image}
        alt=""
      />
      <span className="path-step-course-picker__copy">
        <span>{course.title}</span>
        <small dir="ltr">{course.slug}</small>
      </span>
    </>
  );
}
