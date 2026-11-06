import type { Metadata } from "next";
import { headers } from "next/headers";
import { AdminShell } from "../../components/admin/admin-shell";
import { requireOwner } from "../../components/admin/require-owner";
import { privateMetadata } from "../../lib/seo";

export const metadata: Metadata = privateMetadata("پنل مدیریت");

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "/admin";
  const user = await requireOwner(pathname);

  return (
    <AdminShell pathname={pathname} displayName={user.displayName}>
      {children}
    </AdminShell>
  );
}
