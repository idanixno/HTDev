"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Button, Field } from "@zharfa/ui";
import { REQUIRED_FIELD_MESSAGE } from "../lib/field-messages";
import type { PublicNotification } from "../lib/notification-shared";
import type { PublicUser } from "../lib/session";
import { LogoutButton } from "./logout-button";
import { NotificationsPanel } from "./notifications-panel";
import { DxCodeWordmark } from "./dxcode-wordmark";
import { ZharfaStudentMark } from "./zharfa-student-mark";

function PencilIcon() {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M21.8 4.3 3.7 11.3c-1.2.5-1.2 1.1-.2 1.4l4.6 1.4 1.8 5.4c.2.7.4.9 1 .9.6 0 .9-.3 1.2-.6l2.5-2.4 5.2 3.8c1 .5 1.6.2 1.9-.9L22.9 5.7c.3-1.3-.5-1.9-1.1-1.4ZM9.6 14.3l9.9-6.2c.5-.3.9-.1.6.2l-8 7.6-.3 3.4-1.2-3.7-.9-1.3Z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.6.4-1.1.7-1.3-2.3-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7c-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.7 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3.5 9.75h3V20.5h-3V9.75Zm5.75 0h2.88v1.46h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6v6.25h-3v-5.54c0-1.32-.02-3.02-1.84-3.02-1.84 0-2.12 1.44-2.12 2.92v5.64h-3V9.75Z" />
    </svg>
  );
}

function StackOverflowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M17.4 19.4v-5.1h1.7V21H4.5v-6.7h1.7v5.1h11.2Z" />
      <path d="m7.3 13.9.3-1.7 8.4 1.8-.3 1.6-8.4-1.7Zm1.1-4 7.8 3.6-.7 1.5-7.8-3.6.7-1.5Zm2.1-3.8 6.6 5.5-1.1 1.3-6.6-5.5 1.1-1.3Zm4-3.5 1.4 1 .9.6-5.2 7-1.4-1-.9-.6 5.2-7ZM7.6 17.6h8.3v1.7H7.6v-1.7Z" />
    </svg>
  );
}

function NetworkChip({
  href,
  label,
  value,
  icon,
}: {
  href?: string | null;
  label: string;
  value: string;
  icon: ReactNode;
}) {
  const className =
    "presence__net" + (href ? "" : " presence__net--empty");
  const body = (
    <>
      <span className="presence__net-icon">{icon}</span>
      <span className="presence__net-copy">
        <span className="presence__net-label">{label}</span>
        <span className="presence__net-value" dir="ltr">
          {value}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer">
        {body}
      </a>
    );
  }

  return <span className={className}>{body}</span>;
}

export function IdCard({
  user: initial,
  notifications = { items: [], unreadCount: 0 },
}: {
  user: PublicUser;
  notifications?: {
    items: PublicNotification[];
    unreadCount: number;
  };
}) {
  const [user, setUser] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [telegramHandle, setTelegramHandle] = useState(
    initial.telegramHandle ?? "",
  );
  const [githubHandle, setGithubHandle] = useState(initial.githubHandle ?? "");
  const [linkedinHandle, setLinkedinHandle] = useState(
    initial.linkedinHandle ?? "",
  );
  const [stackOverflowHandle, setStackOverflowHandle] = useState(
    initial.stackOverflowHandle ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const telegram = user.telegramHandle?.trim() || "";
  const github = user.githubHandle?.trim() || "";
  const linkedin = user.linkedinHandle?.trim() || "";
  const stackOverflow = user.stackOverflowHandle?.trim() || "";

  function resetForm(next: PublicUser) {
    setDisplayName(next.displayName);
    setTelegramHandle(next.telegramHandle ?? "");
    setGithubHandle(next.githubHandle ?? "");
    setLinkedinHandle(next.linkedinHandle ?? "");
    setStackOverflowHandle(next.stackOverflowHandle ?? "");
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!displayName.trim()) {
      setNameError(REQUIRED_FIELD_MESSAGE);
      return;
    }
    if (displayName.trim().length < 2) {
      setNameError("نام نمایشی حداقل ۲ نویسه است.");
      return;
    }
    setNameError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          telegramHandle: telegramHandle.trim() || null,
          githubHandle: githubHandle.trim() || null,
          linkedinHandle: linkedinHandle.trim() || null,
          stackOverflowHandle: stackOverflowHandle.trim() || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string | string[];
        user?: PublicUser;
      };
      if (!res.ok || !data.user) {
        const fromApi = Array.isArray(data.message)
          ? data.message.filter(Boolean).join("، ")
          : typeof data.message === "string"
            ? data.message
            : null;
        setError(
          fromApi ||
            (res.status === 405
              ? "سرور این درخواست را مسدود کرده است. پیکربندی nginx را برای PATCH بررسی کنید."
              : "ذخیره اطلاعات ممکن نشد."),
        );
        return;
      }
      setUser(data.user);
      resetForm(data.user);
      setEditing(false);
    } catch {
      setError("ارتباط برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="presence disinab" aria-label="شناسه حساب">
      <div className="presence__aura disinab__aura" aria-hidden="true" />
      <div className="presence__plate disinab__plate">
        <div className="presence__corner presence__corner--notes">
          <NotificationsPanel
            items={notifications.items}
            unreadCount={notifications.unreadCount}
          />
        </div>
        {!editing ? (
          <button
            type="button"
            className="presence__btn presence__btn--edit"
            aria-label="ویرایش اطلاعات"
            title="ویرایش اطلاعات"
            onClick={() => {
              setEditing(true);
              setError(null);
            }}
          >
            <PencilIcon />
          </button>
        ) : null}
        <div className="presence__hero">
          <div className="presence__mark" aria-hidden="true">
            <ZharfaStudentMark />
          </div>
          <div className="presence__intro">
            <DxCodeWordmark as="p" className="presence__brand" />
            <div className="presence__title">
              <p className="presence__rank">مهندس</p>
              <h1>{user.displayName}</h1>
            </div>
            <p className="presence__line">
              اینجا مرکز فرمان شماست؛ مسیر را خودتان می‌چینید.
            </p>
          </div>
        </div>

        {editing ? (
          <form className="presence__form" onSubmit={save}>
            <p className="presence__form-kicker">ویرایش حضور</p>
            <div className="presence__form-grid">
              <Field
                id="presence-name"
                label="نام نمایشی"
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setNameError(null);
                }}
                onBlur={() => {
                  if (!displayName.trim()) setNameError(REQUIRED_FIELD_MESSAGE);
                }}
                error={nameError}
                required
              />
              <Field
                id="presence-telegram"
                label="آیدی تلگرام"
                dir="ltr"
                value={telegramHandle}
                onChange={(event) => setTelegramHandle(event.target.value)}
                placeholder="@username"
              />
              <Field
                id="presence-github"
                label="گیت‌هاب"
                dir="ltr"
                value={githubHandle}
                onChange={(event) => setGithubHandle(event.target.value)}
                placeholder="username"
              />
              <Field
                id="presence-linkedin"
                label="لینکدین"
                dir="ltr"
                value={linkedinHandle}
                onChange={(event) => setLinkedinHandle(event.target.value)}
                placeholder="username"
              />
              <Field
                id="presence-stackoverflow"
                label="استک‌اورفلو"
                dir="ltr"
                value={stackOverflowHandle}
                onChange={(event) => setStackOverflowHandle(event.target.value)}
                placeholder="12345/username"
              />
            </div>
            {error ? <p className="presence__error">{error}</p> : null}
            <div className="presence__form-actions">
              <Button type="submit" loading={loading}>
                ذخیره
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                  resetForm(user);
                  setError(null);
                }}
              >
                انصراف
              </Button>
            </div>
          </form>
        ) : (
          <>
            <dl className="presence__facts presence__facts--stack">
              <div>
                <dt>نام کاربری</dt>
                <dd dir="ltr">{user.username}</dd>
              </div>
              <div>
                <dt>شماره تماس</dt>
                <dd dir="ltr">{user.phone?.trim() || "ثبت نشده"}</dd>
              </div>
              <div>
                <dt>ایمیل</dt>
                <dd dir="ltr">{user.email}</dd>
              </div>
            </dl>

            <div className="presence__networks" aria-label="شبکه‌ها">
              <NetworkChip
                label="تلگرام"
                value={telegram ? `@${telegram.replace(/^@/, "")}` : "ثبت نشده"}
                href={
                  telegram
                    ? `https://t.me/${telegram.replace(/^@/, "")}`
                    : null
                }
                icon={<TelegramIcon />}
              />
              <NetworkChip
                label="گیت‌هاب"
                value={github || "ثبت نشده"}
                href={github ? `https://github.com/${github}` : null}
                icon={<GithubIcon />}
              />
              <NetworkChip
                label="لینکدین"
                value={linkedin || "ثبت نشده"}
                href={
                  linkedin ? `https://www.linkedin.com/in/${linkedin}` : null
                }
                icon={<LinkedinIcon />}
              />
              <NetworkChip
                label="استک‌اورفلو"
                value={stackOverflow || "ثبت نشده"}
                href={
                  stackOverflow
                    ? `https://stackoverflow.com/users/${stackOverflow}`
                    : null
                }
                icon={<StackOverflowIcon />}
              />
            </div>
          </>
        )}

        <LogoutButton tone="danger" />
      </div>
    </section>
  );
}
