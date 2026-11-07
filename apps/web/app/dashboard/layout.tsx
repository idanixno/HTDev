import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountNav } from "../../components/account-nav";
import { privateMetadata } from "../../lib/seo";
import { fetchCurrentUser } from "../../lib/session";

export const metadata: Metadata = privateMetadata("حساب من");

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await fetchCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="account-shell">
      <AccountNav isOwner={user.role === "OWNER"} />
      {children}
    </div>
  );
}
