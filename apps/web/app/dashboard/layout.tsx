import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { privateMetadata } from "../../lib/seo";
import { fetchCurrentUser } from "../../lib/session";

export const metadata: Metadata = privateMetadata("حساب من");

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await fetchCurrentUser();
  const pathname = (await headers()).get("x-pathname") ?? "";
  const adminSurface =
    pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/");
  if (adminSurface && user?.role !== "OWNER") notFound();
  if (!user) redirect("/login?next=/dashboard");

  return <div className="folio-shell">{children}</div>;
}
