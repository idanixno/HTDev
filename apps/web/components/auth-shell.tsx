import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="auth-page" aria-labelledby="auth-heading">
      <div className="auth-page__frame">
        <aside className="auth-page__aside">
          <div>
            <p className="auth-page__aside-kicker">ژرفا</p>
            <p className="auth-page__aside-title">اطلس یادگیری عمیق</p>
          </div>
          <p className="auth-page__aside-copy">
            حساب برای خرید تک‌دوره، پیگیری سفارش و دسترسی اسپات‌پلیر است. اشتراک
            یا پخش ویدیو داخل سایت اینجا نیست.
          </p>
        </aside>
        <div className="auth-page__panel">
          <header className="auth-page__header">
            <h1 id="auth-heading" className="auth-page__title">
              {title}
            </h1>
            <p className="auth-page__subtitle">{subtitle}</p>
          </header>
          {children}
          {footer ? <div className="auth-page__footer">{footer}</div> : null}
        </div>
      </div>
    </section>
  );
}
