import Link from "next/link";
import { headers } from "next/headers";

const LINKS = [
  { href: "/dashboard", label: "نمای کلی", exact: true },
  { href: "/dashboard/access", label: "دوره‌های من" },
  { href: "/dashboard/orders", label: "سفارش‌ها" },
  { href: "/dashboard/tickets", label: "پشتیبانی" },
  { href: "/dashboard/notifications", label: "اعلان‌ها" },
  { href: "/dashboard/account", label: "امنیت" },
] as const;

export async function AccountNav({ isOwner }: { isOwner: boolean }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";

  return (
    <nav className="account-nav" aria-label="حساب من">
      {LINKS.map((link) => {
        const current =
          "exact" in link && link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
      {isOwner ? <Link href="/admin">مدیریت</Link> : null}
    </nav>
  );
}
