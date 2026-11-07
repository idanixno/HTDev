"use client";

import { useEffect } from "react";
import { Button } from "@zharfa/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <article className="editorial">
      <p className="editorial__eyebrow">خطا</p>
      <h1>این صفحه کامل بارگذاری نشد</h1>
      <p className="editorial__lead">
        درخواست به مشکل خورد. یک بار دیگر تلاش کنید یا به صفحه اصلی برگردید.
      </p>
      <div className="editorial__actions">
        <Button type="button" onClick={() => reset()}>
          تلاش دوباره
        </Button>
        <Button href="/" variant="secondary">
          خانه
        </Button>
      </div>
    </article>
  );
}
