"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type State = "idle" | "loading" | "done" | "error";

const LABEL: Record<State, string> = {
  idle: "پاکسازی کش",
  loading: "در حال پاکسازی…",
  done: "کش پاک شد",
  error: "پاکسازی ناموفق",
};

function BroomIcon() {
  return (
    <svg
      className="cache-purge__icon"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 3 12.5 11.5" />
      <path d="M9.5 10.5c-2 0-4 1.5-5 4l-1.5 6.5L9.5 19.5c2.5-1 4-3 4-5" />
      <path d="m8.5 9.5 6 6" />
      <path d="M6 17.5 4.5 19" />
    </svg>
  );
}

export function CachePurgeButton() {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (state !== "done" && state !== "error") return;
    const timer = window.setTimeout(() => setState("idle"), 3200);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function purge() {
    setState("loading");
    try {
      const res = await fetch("/api/admin/cache/purge", { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
      setState("done");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  return (
    <button
      type="button"
      className={`cache-purge cache-purge--${state}`}
      onClick={() => void purge()}
      disabled={state === "loading"}
      title="کش همهٔ صفحه‌های عمومی سایت را پاک می‌کند. ذخیرهٔ هر بخش، کش همان بخش را خودکار پاک می‌کند."
    >
      <BroomIcon />
      <span className="cache-purge__label" aria-live="polite">
        {LABEL[state]}
      </span>
    </button>
  );
}
