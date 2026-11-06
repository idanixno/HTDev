"use client";

import { useEffect } from "react";

/** Brief honest pending state, then leave to the real gateway redirect URL. */
export function PendingRedirect({ nextUrl }: { nextUrl: string }) {
  useEffect(() => {
    const t = window.setTimeout(() => {
      window.location.href = nextUrl;
    }, 1200);
    return () => window.clearTimeout(t);
  }, [nextUrl]);

  return (
    <p className="payment-result__hint">
      در حال انتقال به درگاه… اگر منتقل نشدید،{" "}
      <a href={nextUrl}>اینجا را باز کنید</a>.
    </p>
  );
}
