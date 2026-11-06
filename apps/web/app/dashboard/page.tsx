import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, Notice } from "@zharfa/ui";
import { fetchCurrentUser } from "../../lib/session";
import { LogoutButton } from "../../components/logout-button";

export default async function DashboardPage() {
  const user = await fetchCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  return (
    <section className="dashboard" aria-labelledby="dashboard-heading">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">پنل دانشجو</p>
          <h1 id="dashboard-heading" className="dashboard__title">
            سلام، {user.displayName}
          </h1>
          <p className="dashboard__subtitle">
            نمای کلی حساب — دوره‌ها و سفارش‌ها در فازهای بعدی پر می‌شوند.
          </p>
        </div>
        <div className="dashboard__actions">
          <Button href="/courses" variant="secondary">
            مرور دوره‌ها
          </Button>
          <LogoutButton />
        </div>
      </header>

      <div className="dashboard__grid">
        <article className="dashboard__block">
          <h2>پروفایل</h2>
          <dl className="dashboard__meta">
            <div>
              <dt>نام کاربری</dt>
              <dd>{user.username}</dd>
            </div>
            <div>
              <dt>ایمیل</dt>
              <dd>
                {user.email}
                {user.emailVerified ? " · تأییدشده" : " · تأییدنشده"}
              </dd>
            </div>
            <div>
              <dt>موبایل</dt>
              <dd>
                {user.phone ?? "—"}
                {user.phone
                  ? user.phoneVerified
                    ? " · تأییدشده"
                    : " · تأییدنشده"
                  : null}
              </dd>
            </div>
            <div>
              <dt>نقش</dt>
              <dd>{user.role === "OWNER" ? "مالک / مدرس" : "دانشجو"}</dd>
            </div>
          </dl>
        </article>

        <article className="dashboard__block">
          <h2>دوره‌های من</h2>
          <Notice tone="information" title="هنوز ثبت‌نامی نیست">
            وقتی دوره بخری یا رایگان ثبت‌نام کنی، اینجا فهرست می‌شود. پرداخت ساختگی
            نداریم.
          </Notice>
        </article>

        <article className="dashboard__block">
          <h2>دسترسی سریع</h2>
          <ul className="dashboard__links">
            <li>
              <Link href="/">خانه ژرفا</Link>
            </li>
            <li>
              <Link href="/courses">کاتالوگ دوره‌ها</Link>
            </li>
            <li>
              <Link href="/design-system">سیستم طراحی</Link>
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}
