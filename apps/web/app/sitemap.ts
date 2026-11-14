import type { MetadataRoute } from "next";
import {
  fetchAllTopicsForSitemap,
  fetchArticles,
  fetchCourses,
  fetchPath,
  fetchPaths,
  type PublicCourseCard,
} from "../lib/catalog";
import { absoluteUrl } from "../lib/site-url";

async function fetchAllCourses(): Promise<PublicCourseCard[]> {
  // ListCoursesQueryDto caps pageSize at 48.
  const pageSize = 48;
  const first = await fetchCourses({ page: 1, pageSize });
  const items = [...first.items];
  const totalPages = Math.max(1, first.totalPages || 1);
  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchCourses({ page, pageSize });
    items.push(...next.items);
  }
  return items;
}

/** Keep sitemap fresh after Topic/Course publish (avoid stale empty hubs). */
export const revalidate = 60;

/**
 * Public indexable URLs only. Admin, auth, cart, payments omitted.
 * Topic hubs: PUBLISHED + indexable only (via catalog API filter).
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
      url: absoluteUrl("/topics"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const [courses, paths, articles, topics] = await Promise.all([
    fetchAllCourses(),
    fetchPaths(),
    fetchArticles(),
    fetchAllTopicsForSitemap(),
  ]);

  const courseEntries: MetadataRoute.Sitemap = courses
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

  const topicEntries: MetadataRoute.Sitemap = topics.map((topic) => ({
    url: absoluteUrl(topic.href),
    lastModified: topic.updatedAt ? new Date(topic.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  return [
    ...staticEntries,
    ...courseEntries,
    ...pathEntries,
    ...stepEntries,
    ...articleEntries,
    ...topicEntries,
  ];
}
