"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";

export type FooterCmsInitial = {
  enamadHtml: string;
  paymentGatewayHtml: string;
};

export function FooterCmsEditorForm({
  initial,
}: {
  initial: FooterCmsInitial;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function patch(partial: Partial<FooterCmsInitial>) {
    setValues((prev) => ({ ...prev, ...partial }));
    setSaved(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      await authFetch("/api/admin/cms/footer", {
        method: "PATCH",
        body: JSON.stringify({
          enamadHtml: values.enamadHtml.trim() || null,
          paymentGatewayHtml: values.paymentGatewayHtml.trim() || null,
        }),
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره نشان‌ها ناموفق بود.");
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
          نشان‌های اعتماد فوتر به‌روز شد.
        </Notice>
      ) : null}
      <p className="admin-table__muted" style={{ marginTop: 0 }}>
        کد HTML آماده‌ای که اینماد یا درگاه می‌دهد را اینجا بچسبانید (معمولاً
        یک لینک با تصویر). اسکریپت‌ها حذف می‌شوند.
      </p>
      <div className="editor-form__grid">
        <label className="z-field editor-form__wide">
          <span className="z-field__label">HTML اینماد</span>
          <textarea
            className="z-field__control"
            rows={5}
            dir="ltr"
            spellCheck={false}
            value={values.enamadHtml}
            onChange={(e) => patch({ enamadHtml: e.target.value })}
            placeholder='<a href="https://trustseal.enamad.ir/?id=..."><img src="..." alt="enamad" /></a>'
          />
        </label>
        <label className="z-field editor-form__wide">
          <span className="z-field__label">HTML درگاه پرداخت</span>
          <textarea
            className="z-field__control"
            rows={5}
            dir="ltr"
            spellCheck={false}
            value={values.paymentGatewayHtml}
            onChange={(e) => patch({ paymentGatewayHtml: e.target.value })}
            placeholder='<a href="..."><img src="..." alt="درگاه" /></a>'
          />
        </label>
      </div>
      <div className="editor-form__actions">
        <Button type="submit" loading={loading}>
          ذخیرهٔ نشان‌های فوتر
        </Button>
      </div>
    </form>
  );
}
