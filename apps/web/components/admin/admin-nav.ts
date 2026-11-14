export type AdminNavItem = {
  href: string;
  label: string;
  match: string;
  exact?: boolean;
};

export const ADMIN_MENU: Array<{ label: string; items: AdminNavItem[] }> = [
  {
    label: "نمای کلی",
    items: [{ href: "/admin", label: "داشبورد", match: "/admin", exact: true }],
  },
  {
    label: "تحلیل‌ها",
    items: [
      {
        href: "/admin/analytics/courses",
        label: "عملکرد دوره‌ها",
        match: "/admin/analytics/courses",
      },
      {
        href: "/admin/analytics/revenue",
        label: "تحلیل درآمد",
        match: "/admin/analytics/revenue",
      },
    ],
  },
  {
    label: "کاتالوگ",
    items: [
      { href: "/admin/courses", label: "دوره‌ها", match: "/admin/courses" },
      { href: "/admin/categories", label: "دسته‌ها", match: "/admin/categories" },
      { href: "/admin/topics", label: "موضوعات", match: "/admin/topics" },
      { href: "/admin/journal", label: "مقالات", match: "/admin/journal" },
      { href: "/admin/paths", label: "مسیرها", match: "/admin/paths" },
      { href: "/admin/cms", label: "محتوا، هدر و فوتر", match: "/admin/cms" },
    ],
  },
  {
    label: "فروش",
    items: [
      { href: "/admin/orders", label: "سفارش‌ها", match: "/admin/orders" },
      { href: "/admin/customers", label: "مشتریان", match: "/admin/customers" },
      { href: "/admin/coupons", label: "کوپن‌ها", match: "/admin/coupons" },
      { href: "/admin/payments", label: "درگاه‌های پرداخت", match: "/admin/payments" },
    ],
  },
  {
    label: "پشتیبانی",
    items: [
      { href: "/admin/tickets", label: "تیکت‌ها", match: "/admin/tickets" },
      { href: "/admin/spotplayer", label: "پخشگر اسپات‌پلیر", match: "/admin/spotplayer" },
    ],
  },
  {
    label: "سئو",
    items: [
      { href: "/admin/seo", label: "مرکز سئو", match: "/admin/seo", exact: true },
      {
        href: "/admin/seo/google",
        label: "گوگل (GSC/GA4)",
        match: "/admin/seo/google",
      },
    ],
  },
  {
    label: "سیستم",
    items: [
      {
        href: "/admin/integrations",
        label: "یکپارچه‌سازی‌ها",
        match: "/admin/integrations",
      },
      { href: "/admin/activity", label: "گزارش فعالیت", match: "/admin/activity" },
      { href: "/admin/account", label: "پروفایل مدیر", match: "/admin/account" },
    ],
  },
];

export const ADMIN_NAV = ADMIN_MENU.flatMap((group) => group.items);

export function isAdminNavCurrent(pathname: string, item: AdminNavItem) {
  if (item.exact) {
    return pathname === item.match || pathname === `${item.match}/`;
  }
  return pathname === item.match || pathname.startsWith(`${item.match}/`);
}
