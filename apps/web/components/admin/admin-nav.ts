export const ADMIN_NAV = [
  { href: "/admin", label: "داشبورد", match: "/admin", exact: true },
  { href: "/admin/courses", label: "دوره‌ها", match: "/admin/courses" },
  { href: "/admin/categories", label: "دسته‌ها", match: "/admin/categories" },
  { href: "/admin/orders", label: "سفارش‌ها", match: "/admin/orders" },
  { href: "/admin/customers", label: "مشتریان", match: "/admin/customers" },
  { href: "/admin/tickets", label: "تیکت‌ها", match: "/admin/tickets" },
  { href: "/admin/coupons", label: "کوپن‌ها", match: "/admin/coupons" },
  { href: "/admin/payments", label: "درگاه پرداخت", match: "/admin/payments" },
  {
    href: "/admin/spotplayer",
    label: "اسپات‌پلیر",
    match: "/admin/spotplayer",
  },
  { href: "/admin/cms", label: "محتوا / FAQ", match: "/admin/cms" },
  { href: "/admin/activity", label: "گزارش فعالیت", match: "/admin/activity" },
] as const;

export function isAdminNavCurrent(pathname: string, item: (typeof ADMIN_NAV)[number]) {
  if ("exact" in item && item.exact) {
    return pathname === item.match || pathname === `${item.match}/`;
  }
  return pathname === item.match || pathname.startsWith(`${item.match}/`);
}
