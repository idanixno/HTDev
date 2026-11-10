import type { MetadataRoute } from "next";
import { fetchArticles, fetchCourses, fetchPath, fetchPaths } from "../lib/catalog";
import { absoluteUrl } from "../lib/site-url";

/**
 * Public indexable URLs only. Admin, auth, cart, payments omitted.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/courses"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/paths"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/journal"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/faq"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const [courseList, paths, articles] = await Promise.all([
    fetchCourses({ page: 1, pageSize: 100 }),
    fetchPaths(),
    fetchArticles(),
  ]);

  const courseEntries: MetadataRoute.Sitemap = courseList.items
    .filter((course) => !course.noIndex)
    .map((course) => ({
      url: absoluteUrl(course.href),
      lastModified: course.updatedAt ? new Date(course.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const pathDetails = await Promise.all(paths.map((path) => fetchPath(path.slug)));

  const pathEntries: MetadataRoute.Sitemap = paths.map((path) => ({
    url: absoluteUrl(path.href),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const stepEntries: MetadataRoute.Sitemap = pathDetails.flatMap((path) =>
    (path?.steps ?? [])
      .filter((step) => !step.noIndex)
      .map((step) => ({
        url: absoluteUrl(step.href),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
  );

  const articleEntries: MetadataRoute.Sitemap = articles
    .filter((article) => !article.noIndex)
    .map((article) => ({
      url: absoluteUrl(article.href),
      lastModified: article.publishedAt
        ? new Date(article.publishedAt)
        : now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [
    ...staticEntries,
    ...courseEntries,
    ...pathEntries,
    ...stepEntries,
    ...articleEntries,
  ];
}
