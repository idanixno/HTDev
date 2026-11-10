"use client";

import { useState } from "react";

export function LicenseKey({ id, value }: { id: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="access-card__key">
      <span id={`${id}-label`}>کلید لایسنس</span>
      <div className="access-card__key-row">
        <code dir="ltr" aria-labelledby={`${id}-label`}>
          {value}
        </code>
        <button type="button" onClick={() => void copy()}>
          {copied ? "کپی شد" : "کپی"}
        </button>
      </div>
    </div>
  );
}
