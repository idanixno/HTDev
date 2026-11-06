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
      <div className="auth-page__panel">
        <header className="auth-page__header">
          <p className="auth-page__brand">ژرفا</p>
          <h1 id="auth-heading" className="auth-page__title">
            {title}
          </h1>
          <p className="auth-page__subtitle">{subtitle}</p>
        </header>
        {children}
        {footer ? <div className="auth-page__footer">{footer}</div> : null}
      </div>
    </section>
  );
}
