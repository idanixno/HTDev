import type { MetadataRoute } from "next";
import { siteUrl } from "../lib/site-url";

/**
 * Public crawl rules only. Private surfaces are disallowed here and also
 * emit X-Robots-Tag / metadata robots=noindex.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/courses",
          "/courses/",
          "/paths",
          "/paths/",
          "/journal",
          "/journal/",
          "/about",
          "/faq",
          "/contact",
          "/terms",
          "/privacy",
          "/refunds",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/dashboard",
          "/dashboard/",
          "/login",
          "/register",
          "/recover",
          "/payments",
          "/payments/",
          "/api/",
          "/design-system",
          "/design-system/",
          "/maintenance",
          "/forbidden",
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
