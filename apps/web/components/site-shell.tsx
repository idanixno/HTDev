"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function SiteShell({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname() || "";
  const admin = isAdminPath(pathname);

  return (
    <div className={admin ? "shell shell--admin" : "shell"}>
      {admin ? null : header}
      <main className="shell__main">{children}</main>
      {admin ? null : footer}
    </div>
  );
}
