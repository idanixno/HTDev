import type { Metadata } from "next";
import { AdminShell } from "../../components/admin/admin-shell";
import { requireOwner } from "../../components/admin/require-owner";
import { SiteHeader } from "../../components/site-header";
import { fetchAdminNavBadges } from "../../lib/admin";
import { privateMetadata } from "../../lib/seo";

export const metadata: Metadata = privateMetadata("پنل مدیریت");

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOwner();
  const badges = await fetchAdminNavBadges();

  return (
    <div className="shell shell--admin">
      <SiteHeader />
      <main className="shell__main">
        <AdminShell displayName={user.displayName} badges={badges}>
          {children}
        </AdminShell>
      </main>
    </div>
  );
}
