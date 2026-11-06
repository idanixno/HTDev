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
            نمای کلی حساب — سفارش‌ها، دسترسی اسپات‌پلیر و وضعیت پرداخت.
          </p>
        </div>
        <div className="dashboard__actions">
          <Button href="/dashboard/access" variant="primary">
            دسترسی دوره‌ها
          </Button>
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
          <h2>سفارش‌ها</h2>
          <Notice tone="information" title="تاریخچه پرداخت">
            وضعیت سفارش‌ها را در{" "}
            <Link href="/dashboard/orders">تاریخچه سفارش‌ها</Link> ببینید. فقط
            پس از verify درگاه، وضعیت PAID می‌شود.
          </Notice>
        </article>

        <article className="dashboard__block">
          <h2>دسترسی اسپات‌پلیر</h2>
          <Notice tone="information" title="لایسنس جدا از پرداخت">
            کلید لایسنس فقط پس از پاسخ واقعی اسپات‌پلیر در{" "}
            <Link href="/dashboard/access">صفحه دسترسی</Link> دیده می‌شود — بدون
            موفقیت ساختگی.
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
              <Link href="/dashboard/orders">تاریخچه سفارش‌ها</Link>
            </li>
            <li>
              <Link href="/dashboard/access">لایسنس و دسترسی</Link>
            </li>
            {user.role === "OWNER" ? (
              <li>
                <Link href="/dashboard/admin/spotplayer">ادمین اسپات‌پلیر</Link>
              </li>
            ) : null}
            <li>
              <Link href="/design-system">سیستم طراحی</Link>
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}
