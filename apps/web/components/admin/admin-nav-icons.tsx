import type { ReactNode } from "react";

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="admin-shell__icon"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const ICONS: Record<string, ReactNode> = {
  "/admin": (
    <NavIcon>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </NavIcon>
  ),
  "/admin/courses": (
    <NavIcon>
      <path d="M4 5.5h11.5A2.5 2.5 0 0 1 18 8v10.5H6.5A2.5 2.5 0 0 0 4 21" />
      <path d="M4 5.5V21" />
      <path d="M8 9h6.5" />
      <path d="M8 12.5h5" />
    </NavIcon>
  ),
  "/admin/categories": (
    <NavIcon>
      <path d="M4 8.5 12 4l8 4.5-8 4.5L4 8.5Z" />
      <path d="M4 12.5 12 17l8-4.5" />
      <path d="M4 16.5 12 21l8-4.5" />
    </NavIcon>
  ),
  "/admin/topics": (
    <NavIcon>
      <circle cx="12" cy="7" r="2.4" />
      <circle cx="6.5" cy="16.5" r="2.2" />
      <circle cx="17.5" cy="16.5" r="2.2" />
      <path d="M12 9.4v2.2" />
      <path d="M10.2 13.2 7.8 14.8" />
      <path d="M13.8 13.2 16.2 14.8" />
    </NavIcon>
  ),
  "/admin/journal": (
    <NavIcon>
      <path d="M7 4.5h8.5A2.5 2.5 0 0 1 18 7v13H9A2.5 2.5 0 0 1 6.5 17.5V6A1.5 1.5 0 0 1 8 4.5" />
      <path d="M10 9h5" />
      <path d="M10 12.5h5" />
      <path d="M10 16h3.5" />
    </NavIcon>
  ),
  "/admin/paths": (
    <NavIcon>
      <circle cx="6.5" cy="6.5" r="2" />
      <circle cx="17.5" cy="17.5" r="2" />
      <path d="M8.3 7.8 15.7 16.2" />
      <path d="M14 6.5h3.5V10" />
      <path d="M10 17.5H6.5V14" />
    </NavIcon>
  ),
  "/admin/cms": (
    <NavIcon>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 9h17" />
      <path d="M9 9v10.5" />
    </NavIcon>
  ),
  "/admin/orders": (
    <NavIcon>
      <path d="M7 8.5h10l-.8 9.2a1.7 1.7 0 0 1-1.7 1.5H9.5a1.7 1.7 0 0 1-1.7-1.5L7 8.5Z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </NavIcon>
  ),
  "/admin/customers": (
    <NavIcon>
      <circle cx="9" cy="8" r="2.6" />
      <path d="M4.5 18.5c.4-3 2.3-4.6 4.5-4.6s4.1 1.6 4.5 4.6" />
      <circle cx="16.2" cy="9" r="2.1" />
      <path d="M15 14c1.8.2 3.3 1.3 3.8 3.5" />
    </NavIcon>
  ),
  "/admin/coupons": (
    <NavIcon>
      <path d="M4.5 9.2A2.2 2.2 0 0 0 6.7 7h10.6A2.2 2.2 0 0 0 19.5 9.2v1.3a1.8 1.8 0 1 1 0 3.6v1.3A2.2 2.2 0 0 1 17.3 17.6H6.7A2.2 2.2 0 0 1 4.5 15.4v-1.3a1.8 1.8 0 1 1 0-3.6V9.2Z" />
      <path d="M10 9.5v5.5" strokeDasharray="2 2.2" />
    </NavIcon>
  ),
  "/admin/payments": (
    <NavIcon>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M7 14.5h4" />
    </NavIcon>
  ),
  "/admin/tickets": (
    <NavIcon>
      <path d="M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H10l-3.5 2.8V16.5H5A1.5 1.5 0 0 1 3.5 15V8A1.5 1.5 0 0 1 5 6.5Z" />
      <path d="M8 10.5h8" />
      <path d="M8 13.5h5" />
    </NavIcon>
  ),
  "/admin/spotplayer": (
    <NavIcon>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M10.2 9.2v6.1l5.2-3.05L10.2 9.2Z" fill="currentColor" stroke="none" />
    </NavIcon>
  ),
  "/admin/seo": (
    <NavIcon>
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="M15 15.2 19.5 19.7" />
    </NavIcon>
  ),
  "/admin/seo/google": (
    <NavIcon>
      <path d="M4 18.5V8.5l5 3.2 3.2-5.2 3.3 4.4L20 6.5" />
      <path d="M4 18.5h16" />
    </NavIcon>
  ),
  "/admin/integrations": (
    <NavIcon>
      <path d="M8.5 10.5 6.2 8.2a2.6 2.6 0 0 1 3.7-3.7l2.3 2.3" />
      <path d="M15.5 13.5l2.3 2.3a2.6 2.6 0 0 1-3.7 3.7l-2.3-2.3" />
      <path d="M9.8 14.2 14.2 9.8" />
    </NavIcon>
  ),
  "/admin/activity": (
    <NavIcon>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3.2 2" />
    </NavIcon>
  ),
};

export function AdminNavIcon({ href }: { href: string }) {
  return ICONS[href] ?? null;
}
