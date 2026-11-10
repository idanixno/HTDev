import type { Metadata } from "next";
import { privateMetadata } from "../../../lib/seo";

export const metadata: Metadata = privateMetadata("پرداخت");

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
