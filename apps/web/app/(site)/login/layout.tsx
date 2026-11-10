import type { Metadata } from "next";
import { privateMetadata } from "../../../lib/seo";

export const metadata: Metadata = privateMetadata("ورود");

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
