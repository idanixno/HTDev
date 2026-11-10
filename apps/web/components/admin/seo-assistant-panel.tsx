"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Button, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";

export type SeoAssistantValues = {
  entityType: "COURSE" | "ARTICLE" | "PATH_STEP";
  entityId?: string;
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  summary: string;
  body: string;
  coverAsset: string;
  ogImage?: string;
  noIndex: boolean;
  published: boolean;
};

type AnalyzeResult = {
  scores: {
    overall: number;
    metadata: number;
    onpage: number;
    content: number;
    media: number;
    structure: number;
    links: number;
  };
  diagnostics: {
    titleLength: number;
    titleIdeal: [number, number];
    descriptionLength: number;
    descriptionIdeal: [number, number];
    bodyChars: number;
    bodyWords: number;
    h2Count: number;
    h3Count: number;
    imageCount: number;
    imagesMissingAlt: number;
    internalLinks: number;
    faqCount: number;
  };
  issues: Array<{
    id: string;
    severity: "critical" | "warning" | "suggestion";
    field?: string;
    message: string;
    fixHint?: string;
  }>;
};

type Suggestion = {
  id: string;
  action: string;
  suggestion: string;
  alternatives: string[];
  rationale: string;
  draft: string;
};

const ACTIONS: Array<{
  id: Suggestion["action"];
  label: string;
  field?: keyof SeoAssistantValues;
}> = [
  { id: "seo_title", label: "عنوان SEO", field: "seoTitle" },
  { id: "seo_description", label: "توضیح متا", field: "seoDescription" },
  { id: "slug", label: "اسلاگ", field: "slug" },
  { id: "intro", label: "مقدمه / خلاصه", field: "summary" },
  { id: "outline", label: "ساختار تیترها" },
  { id: "faq", label: "FAQ پیشنهادی" },
];

const SCORE_LABELS = [
  ["metadata", "متاداده"],
  ["onpage", "آن‌پیج"],
  ["content", "محتوا"],
  ["media", "رسانه"],
  ["structure", "ساختار"],
  ["links", "لینک"],
] as const;

function Meter({
  label,
  value,
  ideal,
  unit = "نویسه",
}: {
  label: string;
  value: number;
  ideal: [number, number];
  unit?: string;
}) {
  const [min, max] = ideal;
  const ok = value >= min && value <= max;
  const softMax = Math.max(max * 1.4, max + 40);
  const pct = Math.max(0, Math.min(100, (value / softMax) * 100));
  return (
    <div className="seo-assistant__meter" data-ok={ok ? "1" : "0"}>
      <div className="seo-assistant__meter-head">
        <span>{label}</span>
        <strong>
          {value.toLocaleString("fa-IR")} {unit}
        </strong>
      </div>
      <div className="seo-assistant__meter-track" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>
      <p>
        بازهٔ استاندارد: {min.toLocaleString("fa-IR")}–
        {max.toLocaleString("fa-IR")}
      </p>
    </div>
  );
}

export function SeoAssistantPanel({
  values,
  onApply,
}: {
  values: SeoAssistantValues;
  onApply: (patch: Partial<SeoAssistantValues>) => void;
}) {
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    void authFetch<{ configured: boolean }>("/api/admin/seo/ai-status")
      .then((data) => setAiConfigured(data.configured))
      .catch(() => setAiConfigured(false));
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      void authFetch<AnalyzeResult>("/api/admin/seo/analyze", {
        method: "POST",
        body: JSON.stringify({
          entityType: values.entityType,
          title: values.title,
          slug: values.slug,
          seoTitle: values.seoTitle,
          seoDescription: values.seoDescription,
          summary: values.summary,
          body: values.body,
          coverAsset: values.coverAsset || null,
          ogImage: values.ogImage || null,
          noIndex: values.noIndex,
          published: values.published,
        }),
        signal: controller.signal,
      })
        .then((data) => setAnalysis(data))
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
        });
    }, 450);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [values]);

  async function requestSuggestion(action: string) {
    setError(null);
    setBusyAction(action);
    try {
      const data = await authFetch<{
        id?: string;
        suggestion: string;
        alternatives?: string[];
        rationale?: string;
      }>("/api/admin/seo/suggest", {
        method: "POST",
        body: JSON.stringify({
          action,
          entityType: values.entityType,
          entityId: values.entityId,
          title: values.title,
          slug: values.slug,
          seoTitle: values.seoTitle,
          seoDescription: values.seoDescription,
          summary: values.summary,
          body: values.body,
          coverAsset: values.coverAsset || null,
          noIndex: values.noIndex,
          published: values.published,
        }),
      });
      setSuggestions((prev) => [
        {
          id: data.id ?? `${action}-${Date.now()}`,
          action,
          suggestion: data.suggestion,
          alternatives: data.alternatives ?? [],
          rationale: data.rationale ?? "",
          draft: data.suggestion,
        },
        ...prev.filter((item) => item.action !== action),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "پیشنهاد ساخته نشد.");
    } finally {
      setBusyAction(null);
    }
  }

  async function decide(
    item: Suggestion,
    decision: "ACCEPTED" | "EDITED" | "REJECTED",
  ) {
    try {
      await authFetch("/api/admin/seo/decision", {
        method: "POST",
        body: JSON.stringify({
          suggestionId: item.id,
          decision,
          finalText: item.draft,
        }),
      });
    } catch {
      /* non-blocking audit */
    }

    if (decision === "REJECTED") {
      setSuggestions((prev) => prev.filter((s) => s.id !== item.id));
      return;
    }

    const meta = ACTIONS.find((a) => a.id === item.action);
    if (meta?.field) {
      onApply({ [meta.field]: item.draft } as Partial<SeoAssistantValues>);
    }
    setSuggestions((prev) => prev.filter((s) => s.id !== item.id));
  }

  const score = analysis?.scores.overall ?? null;
  const tone =
    score == null
      ? "pending"
      : score >= 85
        ? "good"
        : score >= 65
          ? "ok"
          : "weak";

  return (
    <aside className="seo-assistant" aria-label="دستیار SEO" data-tone={tone}>
      <header className="seo-assistant__head">
        <p className="seo-assistant__eyebrow">SEO Analyzer</p>
        <h2>دستیار بهینه‌سازی</h2>
        {score != null ? (
          <div className="seo-assistant__score">
            <div
              className="seo-assistant__ring"
              style={{ "--seo-score": score } as CSSProperties}
              aria-hidden="true"
            >
              <strong>{score.toLocaleString("fa-IR")}</strong>
            </div>
            <div>
              <p>امتیاز استاندارد</p>
              <span>از ۱۰۰ · وزن‌دهی محتوا و متاداده</span>
            </div>
          </div>
        ) : (
          <p className="seo-assistant__score-pending">در حال تحلیل دقیق…</p>
        )}
      </header>

      {analysis?.diagnostics ? (
        <div className="seo-assistant__meters">
          <Meter
            label="طول عنوان SEO"
            value={analysis.diagnostics.titleLength}
            ideal={analysis.diagnostics.titleIdeal}
          />
          <Meter
            label="طول توضیح متا"
            value={analysis.diagnostics.descriptionLength}
            ideal={analysis.diagnostics.descriptionIdeal}
          />
          <Meter
            label="حجم محتوا"
            value={analysis.diagnostics.bodyWords}
            ideal={
              values.entityType === "ARTICLE"
                ? [300, 1200]
                : values.entityType === "PATH_STEP"
                  ? [180, 800]
                  : [40, 200]
            }
            unit="واژه"
          />
        </div>
      ) : null}

      {analysis ? (
        <ul className="seo-assistant__scores">
          {SCORE_LABELS.map(([key, label]) => (
            <li key={key}>
              <span>{label}</span>
              <div className="seo-assistant__bar" aria-hidden="true">
                <span style={{ width: `${analysis.scores[key]}%` }} />
              </div>
              <strong>
                {analysis.scores[key].toLocaleString("fa-IR")}٪
              </strong>
            </li>
          ))}
        </ul>
      ) : null}

      {analysis?.issues?.length ? (
        <ul className="seo-assistant__issues">
          {analysis.issues.slice(0, 10).map((issue) => (
            <li key={issue.id} data-severity={issue.severity}>
              <strong>
                {issue.severity === "critical"
                  ? "بحرانی"
                  : issue.severity === "warning"
                    ? "هشدار"
                    : "پیشنهاد"}
              </strong>
              <span>{issue.message}</span>
              {issue.fixHint ? <em>{issue.fixHint}</em> : null}
            </li>
          ))}
        </ul>
      ) : null}

      {aiConfigured === false ? (
        <Notice tone="information" title="OpenAI پیکربندی نشده">
          برای پیشنهادهای AI، کلید را در{" "}
          <Link href="/admin/integrations">یکپارچه‌سازی‌ها</Link> ذخیره کنید.
          تحلیل قطعی همین‌جا بدون کلید کار می‌کند.
        </Notice>
      ) : null}

      {error ? (
        <Notice tone="error" title="خطا">
          {error}
        </Notice>
      ) : null}

      <div className="seo-assistant__actions">
        {ACTIONS.map((action) => (
          <Button
            key={action.id}
            type="button"
            variant="secondary"
            disabled={busyAction != null || aiConfigured === false}
            onClick={() => void requestSuggestion(action.id)}
          >
            {busyAction === action.id ? "…" : action.label}
          </Button>
        ))}
      </div>

      {suggestions.map((item) => (
        <div key={item.id} className="seo-assistant__card">
          <p className="seo-assistant__card-action">
            {ACTIONS.find((a) => a.id === item.action)?.label ?? item.action}
          </p>
          {item.rationale ? (
            <p className="seo-assistant__rationale">{item.rationale}</p>
          ) : null}
          <textarea
            className="seo-assistant__draft"
            rows={4}
            value={item.draft}
            onChange={(e) =>
              setSuggestions((prev) =>
                prev.map((s) =>
                  s.id === item.id ? { ...s, draft: e.target.value } : s,
                ),
              )
            }
          />
          <div className="seo-assistant__card-actions">
            <Button
              type="button"
              onClick={() =>
                void decide(
                  item,
                  item.draft !== item.suggestion ? "EDITED" : "ACCEPTED",
                )
              }
            >
              اعمال
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void requestSuggestion(item.action)}
            >
              تولید مجدد
            </Button>
            <button
              type="button"
              className="seo-assistant__reject"
              onClick={() => void decide(item, "REJECTED")}
            >
              رد
            </button>
          </div>
        </div>
      ))}
    </aside>
  );
}
