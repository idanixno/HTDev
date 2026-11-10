"use client";

import { useState } from "react";

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";

export function AssetImageField({
  id,
  name,
  label,
  value,
  placeholder,
  disabled,
  className,
  onChange,
}: {
  id: string;
  name?: string;
  label: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onChange: (next: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function upload(file: File) {
    if (file.size <= 0 || file.size > MAX_BYTES) {
      setNote("حجم تصویر باید کمتر از ۸ مگابایت باشد.");
      return;
    }
    const body = new FormData();
    body.set("file", file);
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/admin/uploads/image", {
        method: "POST",
        body,
      });
      const data = (await res.json()) as { url?: string; message?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.message || "بارگذاری تصویر ناموفق بود.");
      }
      onChange(data.url);
      setNote("تصویر بارگذاری شد. ذخیره را بزنید تا اعمال شود.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "بارگذاری تصویر ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={["asset-image-field", className].filter(Boolean).join(" ")}
    >
      <label className="z-field" htmlFor={id}>
        <span className="z-field__label">{label}</span>
        <input
          id={id}
          className="z-field__control z-field__control--mono"
          name={name}
          dir="ltr"
          value={value}
          placeholder={placeholder ?? "/media/covers/…"}
          disabled={disabled || busy}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      <label className="asset-image-field__file">
        <span>
          {busy ? "در حال بارگذاری…" : "یا فایل تصویر را بارگذاری کنید"}
        </span>
        <input
          type="file"
          accept={ACCEPT}
          disabled={disabled || busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void upload(file);
          }}
        />
      </label>
      {value.trim() ? (
        <div className="asset-image-field__preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.trim()} alt="" />
        </div>
      ) : null}
      {note ? <p className="asset-image-field__note">{note}</p> : null}
    </div>
  );
}
