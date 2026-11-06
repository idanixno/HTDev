import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";
import { LogoutButton } from "../logout-button";
import { ADMIN_NAV, isAdminNavCurrent } from "./admin-nav";

export function AdminShell({
  pathname,
  displayName,
  children,
}: {
  pathname: string;
  displayName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell">
      <aside className="admin-shell__aside" aria-label="منوی ادمین">
        <div className="admin-shell__brand">
          <Link href="/admin" className="admin-shell__brand-link">
            <span className="admin-shell__brand-name">ژرفا</span>
            <span className="admin-shell__brand-tag">پنل مدیریت</span>
          </Link>
        </div>
        <nav className="admin-shell__nav">
          {ADMIN_NAV.map((item) => {
            const current = isAdminNavCurrent(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "admin-shell__link" +
                  (current ? " admin-shell__link--current" : "")
                }
                aria-current={current ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-shell__aside-foot">
          <p className="admin-shell__user">{displayName}</p>
          <Link href="/dashboard" className="admin-shell__muted-link">
            پنل دانشجو
          </Link>
          <Link href="/" className="admin-shell__muted-link">
            سایت عمومی
          </Link>
        </div>
      </aside>

      <div className="admin-shell__main">
        <header className="admin-shell__top">
          <p className="admin-shell__top-title">مدیریت ژرفا</p>
          <div className="admin-shell__top-actions">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>
        <div className="admin-shell__content">{children}</div>
      </div>
    </div>
  );
}
