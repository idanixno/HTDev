"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    function openFromHash() {
      if (window.location.hash === "#notes") setOpen(true);
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  async function markAll() {
    setPending(true);
    try {
      await authFetch("/api/notifications/read-all", { method: "POST" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const label =
    unreadCount > 0
      ? `اعلان‌ها، ${unreadCount.toLocaleString("fa-IR")} خوانده‌نشده`
      : "اعلان‌ها";

  return (
    <div className="folio-notes disinab-notes" id="notes" ref={rootRef}>
      <button
        type="button"
        className={
          "folio-notes__bell" + (unreadCount > 0 ? " is-unread" : "")
        }
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="folio-notes__count">
            {unreadCount.toLocaleString("fa-IR")}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          className="folio-notes__panel disinab-notes__panel"
          id={panelId}
          role="region"
          aria-label="اعلان‌ها"
        >
          <div className="disinab-notes__aura" aria-hidden="true" />
          <div className="disinab-notes__plate">
            <header className="folio-notes__bar disinab-notes__bar">
              <div className="disinab-notes__heading">
                <p className="disinab-notes__status">
                  {unreadCount > 0
                    ? `${unreadCount.toLocaleString("fa-IR")} خوانده‌نشده`
                    : "اعلانی نمانده"}
                </p>
              </div>
              {unreadCount > 0 ? (
                <button type="button" disabled={pending} onClick={markAll}>
                  همه را خواندم
                </button>
              ) : null}
            </header>
            {items.length === 0 ? (
              <p className="folio-notes__empty">اعلانی نیست.</p>
            ) : (
              <ul className="notify-list disinab-notes__list">
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={
                      "notify-item disinab-notes__item" +
                      (n.readAt ? "" : " notify-item--unread")
                    }
                  >
                    <h2>
                      {n.readAt ? null : (
                        <span className="notify-item__dot" aria-hidden="true" />
                      )}
                      {n.title}
                    </h2>
                    <p>{n.body}</p>
                    <time className="notify-item__time" dateTime={n.createdAt}>
                      {new Date(n.createdAt).toLocaleString("fa-IR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M6.2 9.2a5.8 5.8 0 0 1 11.6 0c0 4.6 1.6 6.2 2.2 6.8H4c.6-.6 2.2-2.2 2.2-6.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 18.2a2 2 0 0 0 4 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
