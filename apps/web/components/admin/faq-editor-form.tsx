"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";
import { MarkdownEditor } from "./markdown-editor";

export type FaqEditorInitial = {
  question: string;
  answer: string;
  sortOrder: string;
  published: boolean;
};

const EMPTY: FaqEditorInitial = {
  question: "",
  answer: "",
  sortOrder: "0",
  published: true,
};

export function FaqEditorForm({
  faqId,
  initial,
}: {
  faqId?: string;
  initial?: Partial<FaqEditorInitial>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<FaqEditorInitial>({
    ...EMPTY,
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function patch(partial: Partial<FaqEditorInitial>) {
    setValues((prev) => ({ ...prev, ...partial }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const saved = await authFetch<{ id: string }>(
        faqId ? `/api/admin/cms/faq/${faqId}` : "/api/admin/cms/faq",
        {
          method: faqId ? "PATCH" : "POST",
          body: JSON.stringify({
            question: values.question.trim(),
            answer: values.answer.trim(),
            sortOrder: Number(values.sortOrder || 0),
            published: values.published,
          }),
        },
      );
      router.push(`/admin/cms/faq/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره پرسش ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  async function removeFaq() {
    if (!faqId) return;
    if (!window.confirm("این پرسش حذف شود؟")) return;
    setLoading(true);
    setError(null);
    try {
      await authFetch(`/api/admin/cms/faq/${faqId}`, { method: "DELETE" });
      router.push("/admin/cms");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف پرسش ناموفق بود.");
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
          id="faq-question"
          name="question"
          label="سؤال"
          className="editor-form__wide"
          value={values.question}
          onChange={(e) => patch({ question: e.target.value })}
          required
        />
        <MarkdownEditor
          id="faq-answer"
          name="answer"
          label="پاسخ"
          variant="basic"
          rows={8}
          maxLength={4000}
          required
          value={values.answer}
          onChange={(answer) => patch({ answer })}
        />
        <Field
          id="faq-sort"
          name="sortOrder"
          label="ترتیب"
          type="number"
          value={values.sortOrder}
          onChange={(e) => patch({ sortOrder: e.target.value })}
        />
        <label className="editor-check">
          <input
            type="checkbox"
            checked={values.published}
            onChange={(e) => patch({ published: e.target.checked })}
          />
          <span>منتشر شود</span>
        </label>
      </div>
      <div className="editor-form__actions">
        <Button type="submit" loading={loading}>
          {faqId ? "ذخیره پرسش" : "ایجاد پرسش"}
        </Button>
        <Button href="/admin/cms" variant="secondary">
          بازگشت
        </Button>
        {faqId ? (
          <Button
            type="button"
            variant="danger"
            loading={loading}
            onClick={removeFaq}
          >
            حذف
          </Button>
        ) : null}
      </div>
    </form>
  );
}
