import type { MetadataRoute } from "next";
import { fetchCourses, fetchPaths } from "../lib/catalog";
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
  ];

  const [courseList, paths] = await Promise.all([
    fetchCourses({ page: 1, pageSize: 100 }),
    fetchPaths(),
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

  return [...staticEntries, ...courseEntries, ...pathEntries];
}
