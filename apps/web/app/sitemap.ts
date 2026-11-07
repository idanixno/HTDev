import type { MetadataRoute } from "next";
import { fetchArticles, fetchCourses, fetchPaths } from "../lib/catalog";
import { absoluteUrl } from "../lib/site-url";

/**
 * Sitemap lists public catalog surfaces only (home, courses, paths).
 * Admin, student dashboard, auth, and payments are intentionally omitted.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/courses"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/paths"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    { url: absoluteUrl("/journal"), changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/faq"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/refunds"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const [courseList, paths, articles] = await Promise.all([
    fetchCourses({ page: 1, pageSize: 100 }),
    fetchPaths(),
    fetchArticles(),
  ]);

  const courseEntries: MetadataRoute.Sitemap = courseList.items.map(
    (course) => ({
      url: absoluteUrl(course.href),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );

  const pathEntries: MetadataRoute.Sitemap = paths.map((path) => ({
    url: absoluteUrl(path.href),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(article.href),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticEntries, ...courseEntries, ...pathEntries, ...articleEntries];
}
