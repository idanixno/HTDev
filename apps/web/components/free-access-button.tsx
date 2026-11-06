"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Notice } from "@zharfa/ui";

export function FreeAccessButton({ courseSlug }: { courseSlug: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function grant() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/spotplayer/access/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug }),
      });
      const data = (await res.json()) as { message?: string | string[] };
      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message.join("، ")
          : data.message || "خطا در دریافت دسترسی رایگان.";
        setError(msg);
        return;
      }
      router.push("/dashboard/access");
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="free-access">
      <Button
        type="button"
        variant="primary"
        onClick={() => void grant()}
        disabled={busy}
      >
        {busy ? "در حال ثبت…" : "دریافت دسترسی رایگان"}
      </Button>
      {error ? (
        <Notice tone="error" title="دسترسی رایگان">
          {error}
        </Notice>
      ) : null}
    </div>
  );
}
