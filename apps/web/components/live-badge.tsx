"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Soft live marker. Only one instance on a page should pass refresh. */
export function LiveBadge({
  intervalMs = 60_000,
  refresh = true,
}: {
  intervalMs?: number;
  refresh?: boolean;
}) {
  const router = useRouter();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!refresh) return;
    const id = window.setInterval(() => {
      setTick((n) => n + 1);
      router.refresh();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, refresh, router]);

  return (
    <span className="live-badge" title="هر دقیقه از پایگاه‌داده تازه می‌شود">
      <i aria-hidden="true" />
      زنده
      {refresh ? (
        <span className="visually-hidden"> به‌روزرسانی {tick}</span>
      ) : null}
    </span>
  );
}

/** @deprecated Prefer LiveBadge */
export const AdminLiveBadge = LiveBadge;
