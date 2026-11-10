"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";

export type PathsCmsInitial = {
  title: string;
  lead: string;
  seoTitle: string;
  seoDescription: string;
};

export function PathsCmsEditorForm({ initial }: { initial: PathsCmsInitial }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function patch(partial: Partial<PathsCmsInitial>) {
    setValues((prev) => ({ ...prev, ...partial }));
    setSaved(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      await authFetch("/api/admin/cms/paths", {
        method: "PATCH",
        body: JSON.stringify({
          title: values.title.trim(),
          lead: values.lead.trim() || null,
          seoTitle: values.seoTitle.trim() || null,
          seoDescription: values.seoDescription.trim() || null,
        }),
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره محتوا ناموفق بود.");
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
      {saved ? (
        <Notice tone="success" title="ذخیره شد">
          عنوان و لید صفحهٔ نقشهٔ راه به‌روز شد.
        </Notice>
      ) : null}
      <div className="editor-form__grid">
        <Field
          id="paths-title"
          label="عنوان صفحه"
          value={values.title}
          onChange={(e) => patch({ title: e.target.value })}
          required
        />
        <label className="z-field" htmlFor="paths-lead">
          <span className="z-field__label">متن معرفی</span>
          <textarea
            id="paths-lead"
            className="z-field__control"
            rows={4}
            value={values.lead}
            onChange={(e) => patch({ lead: e.target.value })}
          />
        </label>
        <Field
          id="paths-seo-title"
          label="عنوان سئو"
          value={values.seoTitle}
          onChange={(e) => patch({ seoTitle: e.target.value })}
        />
        <label className="z-field" htmlFor="paths-seo-description">
          <span className="z-field__label">توضیح سئو</span>
          <textarea
            id="paths-seo-description"
            className="z-field__control"
            rows={3}
            value={values.seoDescription}
            onChange={(e) => patch({ seoDescription: e.target.value })}
          />
        </label>
      </div>
      <div className="editor-form__actions">
        <Button type="submit" disabled={loading}>
          {loading ? "در حال ذخیره…" : "ذخیرهٔ صفحهٔ نقشهٔ راه"}
        </Button>
      </div>
    </form>
  );
}
