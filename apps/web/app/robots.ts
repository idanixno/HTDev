import type { MetadataRoute } from "next";
import { siteUrl } from "../lib/site-url";

/**
 * Crawl policy only — not a security boundary.
 * Private routes are also gated by auth + X-Robots-Tag.
 *
 * AI crawlers (policy can be revised independently):
 * - OAI-SearchBot: allow public content for ChatGPT Search discovery
 * - GPTBot: disallow (training crawl) — separate from SearchBot
 */
const PUBLIC_ALLOW = [
  "/",
  "/artwork/",
  "/courses",
  "/paths",
  "/journal",
  "/topics",
  "/faq",
  "/terms",
] as const;

const PRIVATE_DISALLOW = [
  "/admin",
  "/admin/",
  "/dashboard",
  "/dashboard/",
  "/login",
  "/register",
  "/recover",
  "/cart",
  "/payments",
  "/payments/",
  "/*/purchase",
  "/api/",
  "/design-system",
  "/design-system/",
  "/maintenance",
  "/internal-missing",
] as const;

export default function robots(): MetadataRoute.Robots {
  const origin = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: [...PUBLIC_ALLOW],
        disallow: [...PRIVATE_DISALLOW],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: [...PUBLIC_ALLOW],
        disallow: [...PRIVATE_DISALLOW],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
