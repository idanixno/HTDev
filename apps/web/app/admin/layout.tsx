import type { Metadata } from "next";
import { AdminShell } from "../../components/admin/admin-shell";
import { requireOwner } from "../../components/admin/require-owner";
import { privateMetadata } from "../../lib/seo";

export const metadata: Metadata = privateMetadata("پنل مدیریت");

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOwner();

  return (
    <AdminShell displayName={user.displayName}>{children}</AdminShell>
  );
}
