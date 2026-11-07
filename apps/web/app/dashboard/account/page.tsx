import { redirect } from "next/navigation";
import { PasswordForm } from "../../../components/password-form";
import { fetchCurrentUser } from "../../../lib/session";

export default async function AccountPage() {
  const user = await fetchCurrentUser();
  if (!user) redirect("/login?next=/dashboard/account");

  return (
    <section className="dashboard" aria-labelledby="account-heading">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">حساب</p>
          <h1 id="account-heading" className="dashboard__title">
            امنیت حساب
          </h1>
          <p className="dashboard__subtitle">
            {user.displayName} · {user.email}
          </p>
        </div>
      </header>
      <div className="dashboard__grid">
        <article className="dashboard__block">
          <h2>رمز عبور</h2>
          <PasswordForm />
          <p>
            اگر رمز فعلی را ندارید، ابتدا خارج شوید و از بازیابی رمز استفاده
            کنید. تا زمان اتصال پیامک واقعی، کد بازیابی در گزارش سرور توسعه چاپ
            می‌شود.
          </p>
        </article>
        <article className="dashboard__block">
          <h2>وضعیت تماس</h2>
          <dl className="dashboard__meta">
            <div>
              <dt>ایمیل</dt>
              <dd>{user.emailVerified ? "تأییدشده" : "هنوز تأیید نشده"}</dd>
            </div>
            <div>
              <dt>موبایل</dt>
              <dd>
                {user.phone
                  ? user.phoneVerified
                    ? "تأییدشده"
                    : "ثبت شده و تأیید نشده"
                  : "ثبت نشده"}
              </dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}
