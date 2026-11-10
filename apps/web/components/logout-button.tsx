"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Dialog } from "@zharfa/ui";

function LogoutIcon() {
  return (
    <svg
      className="presence__icon"
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
      <path d="M15 21h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4" />
      <path d="M8 17l-5-5 5-5" />
      <path d="M3 12h12" />
    </svg>
  );
}

function LogoutConfirmDialog({
  open,
  loading,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      className="disinab-dialog"
      title="خروج از حساب؟"
      indexLabel={<span className="disinab-dialog__badge">ژرفا</span>}
      cancelLabel="ماندن"
      confirmLabel={loading ? "در حال خروج…" : "خروج"}
      confirmDanger
      onCancel={() => {
        if (!loading) onCancel();
      }}
      onConfirm={() => {
        if (!loading) onConfirm();
      }}
    >
      <p className="disinab-dialog__line">
        نشست شما بسته می‌شود و برای ادامه باید دوباره وارد شوید.
      </p>
    </Dialog>
  );
}

export function LogoutButton({
  tone = "default",
  className = "",
}: {
  tone?: "default" | "danger";
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setConfirmOpen(false);
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const dialog = (
    <LogoutConfirmDialog
      open={confirmOpen}
      loading={loading}
      onCancel={() => setConfirmOpen(false)}
      onConfirm={() => {
        void logout();
      }}
    />
  );

  if (tone === "danger") {
    return (
      <>
        <button
          type="button"
          className={`presence__logout ${className}`.trim()}
          disabled={loading}
          onClick={() => setConfirmOpen(true)}
        >
          خروج از حساب
          <LogoutIcon />
        </button>
        {dialog}
      </>
    );
  }

  return (
    <>
      <Button
        variant="secondary"
        type="button"
        loading={loading}
        className={className || undefined}
        onClick={() => setConfirmOpen(true)}
      >
        خروج
      </Button>
      {dialog}
    </>
  );
}
