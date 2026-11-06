import type { Metadata } from "next";
import { privateMetadata } from "../../lib/seo";

export const metadata: Metadata = privateMetadata("ثبت‌نام");

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
