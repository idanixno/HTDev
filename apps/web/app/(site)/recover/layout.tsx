import type { Metadata } from "next";
import { privateMetadata } from "../../../lib/seo";

export const metadata: Metadata = privateMetadata("بازیابی رمز");

export default function RecoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
