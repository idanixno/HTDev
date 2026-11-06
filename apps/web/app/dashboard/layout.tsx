import type { Metadata } from "next";
import { privateMetadata } from "../../lib/seo";

export const metadata: Metadata = privateMetadata("حساب من");

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
