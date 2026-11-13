import {
  INSTRUCTOR_NAME,
  SHOW_INSTRUCTOR_NAME,
} from "./instructor-display";
import { absoluteUrl } from "./site-url";

const AUTHOR = {
  "@type": "Person" as const,
  name: INSTRUCTOR_NAME,
  url: absoluteUrl("/"),
};

const PUBLISHER = {
  "@type": "Organization" as const,
  name: "DXCode",
  url: absoluteUrl("/"),
  logo: {
    "@type": "ImageObject" as const,
    url: absoluteUrl("/artwork/courses/clean-architecture.svg"),
  },
};

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    ...PUBLISHER,
    description:
      "DXCode — یادگیری عمیق فناوری؛ از اولین مسئله تا تصمیم‌های مهندسی، با دوره و مسیر روشن.",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DXCode",
    url: absoluteUrl("/"),
    inLanguage: "fa-IR",
    publisher: PUBLISHER,
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/courses")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function courseJsonLd(input: {
  name: string;
  description: string;
  url: string;
  image?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    inLanguage: "fa",
    url: input.url,
    image: input.image ?? undefined,
    provider: PUBLISHER,
    ...(SHOW_INSTRUCTOR_NAME ? { instructor: AUTHOR } : {}),
  };
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  url: string;
  datePublished?: string | null;
  dateModified?: string | null;
  image?: string | null;
  readingMinutes?: number | null;
  wordCount?: number | null;
  articleSection?: string;
}) {
  const image = input.image
    ? input.image.startsWith("http")
      ? input.image
      : absoluteUrl(input.image)
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.headline,
    description: input.description,
    inLanguage: "fa-IR",
    isAccessibleForFree: true,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.url,
    },
    url: input.url,
    datePublished: input.datePublished ?? undefined,
    dateModified: input.dateModified ?? input.datePublished ?? undefined,
    image: image
      ? {
          "@type": "ImageObject",
          url: image,
        }
      : undefined,
    ...(SHOW_INSTRUCTOR_NAME ? { author: AUTHOR } : {}),
    publisher: PUBLISHER,
    articleSection: input.articleSection ?? "مقالات",
    timeRequired:
      input.readingMinutes && input.readingMinutes > 0
        ? `PT${Math.round(input.readingMinutes)}M`
        : undefined,
    wordCount: input.wordCount ?? undefined,
    isPartOf: {
      "@type": "Blog",
      name: "مقالات DXCode",
      url: absoluteUrl("/journal"),
    },
  };
}

export function collectionPageJsonLd(input: {
  name: string;
  description: string;
  url: string;
  items: Array<{ name: string; url: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: "fa-IR",
    isPartOf: {
      "@type": "WebSite",
      name: "DXCode",
      url: absoluteUrl("/"),
    },
    mainEntity:
      input.items.length > 0
        ? {
            "@type": "ItemList",
            itemListElement: input.items.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              url: item.url,
            })),
          }
        : undefined,
  };
}

export function topicPageGraph(input: {
  name: string;
  description: string;
  path: string;
  breadcrumbs: Array<{ name: string; path: string }>;
  items: Array<{ name: string; url: string }>;
}) {
  const url = absoluteUrl(input.path);
  const crumbs = breadcrumbJsonLd(input.breadcrumbs);
  const collection = collectionPageJsonLd({
    name: input.name,
    description: input.description,
    url,
    items: input.items,
  });
  const { "@context": _c1, ...crumbNode } = crumbs;
  const { "@context": _c2, ...collectionNode } = collection;

  return {
    "@context": "https://schema.org",
    "@graph": [crumbNode, collectionNode],
  };
}

export function articlePageGraph(input: {
  headline: string;
  description: string;
  path: string;
  datePublished?: string | null;
  dateModified?: string | null;
  image?: string | null;
  readingMinutes?: number | null;
  wordCount?: number | null;
}) {
  const url = absoluteUrl(input.path);
  const crumbs = breadcrumbJsonLd([
    { name: "خانه", path: "/" },
    { name: "مقالات", path: "/journal" },
    { name: input.headline, path: input.path },
  ]);
  const post = articleJsonLd({
    ...input,
    url,
  });
  const { "@context": _c1, ...crumbNode } = crumbs;
  const { "@context": _c2, ...postNode } = post;

  return {
    "@context": "https://schema.org",
    "@graph": [
      crumbNode,
      postNode,
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: input.headline,
        description: input.description,
        inLanguage: "fa-IR",
        isPartOf: {
          "@type": "WebSite",
          name: "DXCode",
          url: absoluteUrl("/"),
        },
        primaryImageOfPage: input.image
          ? {
              "@type": "ImageObject",
              url: input.image.startsWith("http")
                ? input.image
                : absoluteUrl(input.image),
            }
          : undefined,
      },
    ],
  };
}
