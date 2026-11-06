"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Notice } from "@zharfa/ui";
import { authFetch } from "../lib/api-client";
import type { PublicNotification } from "../lib/notification-shared";

export function NotificationsPanel({
  items,
  unreadCount,
}: {
  items: PublicNotification[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function markAll() {
    setPending(true);
    try {
      await authFetch("/api/notifications/read-all", { method: "POST" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="notify-panel">
      <div className="notify-panel__bar">
        <p>
          {unreadCount > 0
            ? `${unreadCount.toLocaleString("fa-IR")} خوانده‌نشده`
            : "همه خوانده شده‌اند"}
        </p>
        {unreadCount > 0 ? (
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={markAll}
          >
            علامت‌گذاری همه به‌عنوان خوانده
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <Notice tone="information" title="اعلانی نیست">
          پس از رویدادهایی مثل ثبت‌نام، پرداخت تأییدشده، یا پاسخ تیکت اینجا دیده
          می‌شوند.
        </Notice>
      ) : (
        <ul className="notify-list">
          {items.map((n) => (
            <li
              key={n.id}
              className={
                "notify-item" + (n.readAt ? "" : " notify-item--unread")
              }
            >
              <h2>{n.title}</h2>
              <p>{n.body}</p>
              <p className="notify-item__meta">
                {n.eventType} ·{" "}
                {new Date(n.createdAt).toLocaleString("fa-IR")}
                {n.deliveries?.length
                  ? ` · ${n.deliveries.map((d) => `${d.channel}:${d.status}`).join("، ")}`
                  : null}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
