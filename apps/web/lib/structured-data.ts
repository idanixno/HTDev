import { absoluteUrl } from "./site-url";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ژرفا",
    url: absoluteUrl("/"),
    description:
      "آموزش فنی یک مدرس؛ دوره‌ها جدا فروخته می‌شوند و ویدیو در اسپات‌پلیر پخش می‌شود.",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ژرفا",
    url: absoluteUrl("/"),
    inLanguage: "fa-IR",
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
    provider: {
      "@type": "Organization",
      name: "ژرفا",
      url: absoluteUrl("/"),
    },
    instructor: {
      "@type": "Person",
      name: "آرمان راد",
    },
  };
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  url: string;
  datePublished?: string | null;
  dateModified?: string | null;
  image?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    inLanguage: "fa",
    mainEntityOfPage: input.url,
    datePublished: input.datePublished ?? undefined,
    dateModified: input.dateModified ?? undefined,
    image: input.image ?? undefined,
    author: { "@type": "Person", name: "آرمان راد" },
    publisher: {
      "@type": "Organization",
      name: "ژرفا",
      url: absoluteUrl("/"),
    },
  };
}
