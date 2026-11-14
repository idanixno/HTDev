"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@zharfa/ui";

export function CourseFreeEnrollment({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enroll() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/spotplayer/access/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug: slug }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!res.ok) {
        setError(data.message ?? "ثبت‌نام در دوره انجام نشد. دوباره تلاش کنید.");
        return;
      }
      setEnrolled(true);
      router.refresh();
    } catch {
      setError("ارتباط برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  if (enrolled) {
    return (
      <div className="course-enrolled" role="status">
        <p className="course-enrolled__title">شما دانشجوی این دوره هستید</p>
        <Link href="/dashboard#courses" className="z-btn z-btn--secondary">
          مشاهده در حساب من
        </Link>
      </div>
    );
  }

  return (
    <>
      <Button type="button" onClick={enroll} loading={loading}>
        ثبت‌نام در دوره
      </Button>
      {error ? (
        <p className="course-waitlist__error" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
