import Link from "next/link";
import { headers } from "next/headers";
import { LogoutButton } from "./logout-button";
import type { PublicUser } from "../lib/session";

const LINKS = [
  { href: "/dashboard", label: "نمای کلی", exact: true },
  { href: "/dashboard/access", label: "دوره‌های من" },
  { href: "/dashboard/orders", label: "سفارش‌ها" },
  { href: "/dashboard/tickets", label: "پشتیبانی" },
  { href: "/dashboard/notifications", label: "اعلان‌ها" },
  { href: "/dashboard/account", label: "امنیت" },
] as const;

function markOf(name: string): string {
  const trimmed = name.trim();
  return Array.from(trimmed)[0] ?? "ژ";
}

export async function AccountNav({ user }: { user: PublicUser }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";
  const role = user.role === "OWNER" ? "مالک و مدرس" : "دانشجو";

  return (
    <aside className="salon-rail">
      <div className="salon-id">
        <span className="salon-mark" aria-hidden="true">
          {markOf(user.displayName)}
        </span>
        <div>
          <p className="salon-kicker">حساب من</p>
          <p className="salon-name">{user.displayName}</p>
          <p className="salon-role">{role}</p>
        </div>
      </div>
      <p className="salon-mail" dir="ltr">
        {user.email}
      </p>
      <nav className="account-menu" aria-label="حساب من">
        <p className="account-menu__label">حساب</p>
        <ul className="account-nav">
          {LINKS.map((link) => {
            const current =
              "exact" in link && link.exact
                ? pathname === link.href
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <li key={link.href}>
                <Link href={link.href} aria-current={current ? "page" : undefined}>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
        {user.role === "OWNER" ? (
          <>
            <p className="account-menu__label">مدیریت</p>
            <ul className="account-nav">
              <li>
                <Link href="/admin">مدیریت ژرفا</Link>
              </li>
            </ul>
          </>
        ) : null}
      </nav>
      <LogoutButton />
    </aside>
  );
}
