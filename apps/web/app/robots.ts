import type { MetadataRoute } from "next";
import { siteUrl } from "../lib/site-url";

/**
 * Crawl policy only — not a security boundary.
 * Private routes are also gated by auth + X-Robots-Tag.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/artwork/", "/courses", "/paths", "/journal", "/faq", "/terms"],
        disallow: [
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
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
