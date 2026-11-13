"use client";

import { useEffect, useState } from "react";

const LANG_ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  rb: "ruby",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
  dockerfile: "docker",
  rs: "rust",
  "c#": "csharp",
  cs: "csharp",
  plaintext: "text",
  txt: "text",
};

function normalizeLang(raw: string | null | undefined): string {
  const key = (raw ?? "").trim().toLowerCase();
  if (!key) return "text";
  return LANG_ALIASES[key] ?? key;
}

export function ArticleCodeBlock({
  lang,
  text,
}: {
  lang: string | null;
  text: string;
}) {
  const resolved = normalizeLang(lang);
  const label = (lang ?? resolved).trim() || "code";
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHtml(null);

    void (async () => {
      try {
        const { codeToHtml } = await import("shiki");
        const next = await codeToHtml(text, {
          lang: resolved,
          theme: "github-dark",
        });
        if (!cancelled) setHtml(next);
      } catch {
        try {
          const { codeToHtml } = await import("shiki");
          const next = await codeToHtml(text, {
            lang: "text",
            theme: "github-dark",
          });
          if (!cancelled) setHtml(next);
        } catch {
          if (!cancelled) setHtml(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [text, resolved]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="article-body__code" data-lang={resolved}>
      <div className="article-body__code-bar">
        <span className="article-body__lang">{label}</span>
        <button
          type="button"
          className="article-body__code-copy"
          onClick={() => void onCopy()}
          aria-label={copied ? "کپی شد" : "کپی کد"}
        >
          {copied ? "کپی شد" : "کپی"}
        </button>
      </div>
      {html ? (
        <div
          className="article-body__code-surface"
          dir="ltr"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="article-body__code-fallback" dir="ltr">
          <code>{text}</code>
        </pre>
      )}
    </div>
  );
}
