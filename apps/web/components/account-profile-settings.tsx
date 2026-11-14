"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Field } from "@zharfa/ui";
import type { PublicUser } from "../lib/session";

function responseMessage(data: { message?: string | string[] }): string | null {
  if (Array.isArray(data.message)) {
    return data.message.filter(Boolean).join("، ") || null;
  }
  return typeof data.message === "string" ? data.message : null;
}

export function AccountProfileSettings({
  user,
  roleLabel,
}: {
  user: PublicUser;
  roleLabel: string;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(user);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [telegramHandle, setTelegramHandle] = useState(
    user.telegramHandle ?? "",
  );
  const [githubHandle, setGithubHandle] = useState(user.githubHandle ?? "");
  const [linkedinHandle, setLinkedinHandle] = useState(
    user.linkedinHandle ?? "",
  );
  const [stackOverflowHandle, setStackOverflowHandle] = useState(
    user.stackOverflowHandle ?? "",
  );
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileBusy(true);
    setProfileError(null);
    setProfileSaved(false);

    try {
      const response = await fetch("/api/auth/me", {
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
      const data = (await response.json().catch(() => ({}))) as {
        message?: string | string[];
        user?: PublicUser;
      };

      if (!response.ok || !data.user) {
        setProfileError(
          responseMessage(data) ??
            (response.status === 401
              ? "نشست شما پایان یافته است. دوباره وارد شوید."
              : "ذخیرهٔ اطلاعات انجام نشد. دوباره تلاش کنید."),
        );
        return;
      }

      setProfile(data.user);
      setDisplayName(data.user.displayName);
      setTelegramHandle(data.user.telegramHandle ?? "");
      setGithubHandle(data.user.githubHandle ?? "");
      setLinkedinHandle(data.user.linkedinHandle ?? "");
      setStackOverflowHandle(data.user.stackOverflowHandle ?? "");
      setProfileSaved(true);
      router.refresh();
    } catch {
      setProfileError("ارتباط برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setProfileBusy(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("تکرار رمز جدید با رمز واردشده یکسان نیست.");
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError("رمز جدید باید با رمز فعلی متفاوت باشد.");
      return;
    }

    setPasswordBusy(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string | string[];
        ok?: boolean;
      };

      if (!response.ok || !data.ok) {
        setPasswordError(
          responseMessage(data) ??
            (response.status === 401
              ? "رمز فعلی نادرست است یا نشست شما پایان یافته است."
              : "تغییر رمز انجام نشد. دوباره تلاش کنید."),
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.replace("/login?notice=password");
      router.refresh();
    } catch {
      setPasswordError("ارتباط برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <section className="profile-settings" aria-labelledby="profile-settings-title">
      <header className="profile-settings__header">
        <p className="profile-settings__eyebrow">{roleLabel} · تنظیمات حساب</p>
        <h1 id="profile-settings-title">پروفایل و امنیت حساب</h1>
        <p>
          اطلاعات ورود و راه‌های ارتباطی حساب خود را مدیریت کنید. تغییر رمز، همهٔ
          نشست‌های فعال شما را می‌بندد.
        </p>
      </header>

      <form className="profile-settings__panel" onSubmit={saveProfile}>
        <div className="profile-settings__panel-heading">
          <div>
            <h2>اطلاعات پروفایل</h2>
            <p>نام نمایشی و شناسه‌های حرفه‌ای را ویرایش کنید.</p>
          </div>
        </div>

        <div className="profile-settings__identity">
          <div className="profile-settings__fields">
            <Field
              id="account-username"
              label="نام کاربری"
              value={profile.username}
              dir="ltr"
              disabled
              hint="نام کاربری فعلاً از این صفحه قابل تغییر نیست."
            />
            <Field
              id="account-email"
              label="ایمیل"
              type="email"
              value={profile.email}
              dir="ltr"
              disabled
              hint={
                profile.emailVerified
                  ? "ایمیل تأیید شده است."
                  : "ایمیل هنوز تأیید نشده است."
              }
            />
            <Field
              id="account-phone"
              label="شماره موبایل"
              value={profile.phone ?? "ثبت نشده"}
              dir="ltr"
              disabled
              hint={
                profile.phoneVerified
                  ? "شماره موبایل تأیید شده است."
                  : "تغییر شماره در این صفحه پشتیبانی نمی‌شود."
              }
            />
          </div>
        </div>

        <div className="profile-settings__fields">
          <Field
            id="account-display-name"
            label="نام نمایشی"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            minLength={2}
            maxLength={80}
            required
          />
          <Field
            id="account-telegram"
            label="آیدی تلگرام"
            value={telegramHandle}
            onChange={(event) => setTelegramHandle(event.target.value)}
            dir="ltr"
            placeholder="@username"
          />
          <Field
            id="account-github"
            label="نام کاربری گیت‌هاب"
            value={githubHandle}
            onChange={(event) => setGithubHandle(event.target.value)}
            dir="ltr"
            placeholder="username"
          />
          <Field
            id="account-linkedin"
            label="شناسه لینکدین"
            value={linkedinHandle}
            onChange={(event) => setLinkedinHandle(event.target.value)}
            dir="ltr"
            placeholder="username"
          />
          <Field
            id="account-stackoverflow"
            label="شناسه استک‌اورفلو"
            value={stackOverflowHandle}
            onChange={(event) => setStackOverflowHandle(event.target.value)}
            dir="ltr"
            placeholder="12345/username"
          />
        </div>

        {profileError ? (
          <p className="profile-settings__error" role="alert">
            {profileError}
          </p>
        ) : null}
        {profileSaved ? (
          <p className="profile-settings__success" role="status">
            اطلاعات پروفایل ذخیره شد.
          </p>
        ) : null}
        <div className="profile-settings__actions">
          <Button type="submit" loading={profileBusy}>
            ذخیرهٔ پروفایل
          </Button>
        </div>
      </form>

      <form className="profile-settings__panel" onSubmit={changePassword}>
        <div className="profile-settings__panel-heading">
          <div>
            <h2>امنیت و رمز عبور</h2>
            <p>برای تغییر رمز، رمز فعلی را وارد کنید. حداقل طول رمز ۸ نویسه است.</p>
          </div>
        </div>
        <div className="profile-settings__fields profile-settings__fields--password">
          <Field
            id="account-current-password"
            label="رمز فعلی"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            minLength={8}
            maxLength={128}
            required
          />
          <Field
            id="account-new-password"
            label="رمز جدید"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            minLength={8}
            maxLength={128}
            required
          />
          <Field
            id="account-confirm-password"
            label="تکرار رمز جدید"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            maxLength={128}
            required
          />
        </div>
        {passwordError ? (
          <p className="profile-settings__error" role="alert">
            {passwordError}
          </p>
        ) : null}
        <div className="profile-settings__actions">
          <Button type="submit" loading={passwordBusy}>
            تغییر رمز و خروج از نشست‌ها
          </Button>
        </div>
      </form>
    </section>
  );
}
