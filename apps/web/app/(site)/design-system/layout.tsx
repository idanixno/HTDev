import type { Metadata } from "next";
import { privateMetadata } from "../../../lib/seo";

export const metadata: Metadata = privateMetadata("سیستم طراحی");

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
