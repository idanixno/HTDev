"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";

export type HomeCmsInitial = {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export function HomeCmsEditorForm({ initial }: { initial: HomeCmsInitial }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function patch(partial: Partial<HomeCmsInitial>) {
    setValues((prev) => ({ ...prev, ...partial }));
    setSaved(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      await authFetch("/api/admin/cms/home", {
        method: "PATCH",
        body: JSON.stringify({
          heroEyebrow: values.heroEyebrow.trim() || null,
          heroTitle: values.heroTitle.trim(),
          heroSubtitle: values.heroSubtitle.trim() || null,
          primaryCtaLabel: values.primaryCtaLabel.trim() || null,
          primaryCtaHref: values.primaryCtaHref.trim() || null,
          secondaryCtaLabel: values.secondaryCtaLabel.trim() || null,
          secondaryCtaHref: values.secondaryCtaHref.trim() || null,
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
          محتوای صفحهٔ خانه به‌روز شد.
        </Notice>
      ) : null}
      <div className="editor-form__grid">
        <Field
          id="home-eyebrow"
          label="ابرو"
          value={values.heroEyebrow}
          onChange={(e) => patch({ heroEyebrow: e.target.value })}
        />
        <Field
          id="home-title"
          label="عنوان"
          value={values.heroTitle}
          onChange={(e) => patch({ heroTitle: e.target.value })}
          required
        />
        <label className="z-field editor-form__wide">
          <span className="z-field__label">زیرعنوان</span>
          <textarea
            className="z-field__control"
            rows={3}
            value={values.heroSubtitle}
            onChange={(e) => patch({ heroSubtitle: e.target.value })}
          />
        </label>
        <Field
          id="home-cta1-label"
          label="برچسب CTA اصلی"
          value={values.primaryCtaLabel}
          onChange={(e) => patch({ primaryCtaLabel: e.target.value })}
        />
        <Field
          id="home-cta1-href"
          label="لینک CTA اصلی"
          mono
          dir="ltr"
          value={values.primaryCtaHref}
          onChange={(e) => patch({ primaryCtaHref: e.target.value })}
        />
        <Field
          id="home-cta2-label"
          label="برچسب CTA فرعی"
          value={values.secondaryCtaLabel}
          onChange={(e) => patch({ secondaryCtaLabel: e.target.value })}
        />
        <Field
          id="home-cta2-href"
          label="لینک CTA فرعی"
          mono
          dir="ltr"
          value={values.secondaryCtaHref}
          onChange={(e) => patch({ secondaryCtaHref: e.target.value })}
        />
      </div>
      <div className="editor-form__actions">
        <Button type="submit" loading={loading}>
          ذخیرهٔ صفحهٔ خانه
        </Button>
      </div>
    </form>
  );
}
