"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Button, Field } from "@zharfa/ui";
import type { PublicUser } from "../lib/session";
import { LogoutButton } from "./logout-button";
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

export function IdCard({ user: initial }: { user: PublicUser }) {
  const [user, setUser] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [telegramHandle, setTelegramHandle] = useState(
    initial.telegramHandle ?? "",
  );
  const [githubHandle, setGithubHandle] = useState(initial.githubHandle ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const telegram = user.telegramHandle?.trim() || "";
  const github = user.githubHandle?.trim() || "";

  async function save(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          phone: phone.trim() || null,
          telegramHandle: telegramHandle.trim() || null,
          githubHandle: githubHandle.trim() || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        user?: PublicUser;
      };
      if (!res.ok || !data.user) {
        setError(data.message ?? "ذخیره اطلاعات ممکن نشد.");
        return;
      }
      setUser(data.user);
      setDisplayName(data.user.displayName);
      setPhone(data.user.phone ?? "");
      setTelegramHandle(data.user.telegramHandle ?? "");
      setGithubHandle(data.user.githubHandle ?? "");
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
        <div className="presence__hero">
          <div className="presence__mark" aria-hidden="true">
            <ZharfaStudentMark />
          </div>
          <div className="presence__intro">
            <p className="presence__brand">ژرفا</p>
            <div className="presence__title">
              <p className="presence__rank">مهندس</p>
              <h1>{user.displayName}</h1>
            </div>
            <p className="presence__line">
              اینجا مرکز فرمان شماست؛ مسیر را خودتان می‌چینید.
            </p>
          </div>
          <div className="presence__actions">
            <button
              type="button"
              className="presence__btn"
              onClick={() => {
                setEditing(true);
                setError(null);
              }}
            >
              <PencilIcon />
              ویرایش اطلاعات
            </button>
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
                onChange={(event) => setDisplayName(event.target.value)}
                required
              />
              <Field
                id="presence-phone"
                label="شماره تماس"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="09xxxxxxxxx"
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
                  setDisplayName(user.displayName);
                  setPhone(user.phone ?? "");
                  setTelegramHandle(user.telegramHandle ?? "");
                  setGithubHandle(user.githubHandle ?? "");
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
            </div>
          </>
        )}

        <LogoutButton tone="danger" />
      </div>
    </section>
  );
}
