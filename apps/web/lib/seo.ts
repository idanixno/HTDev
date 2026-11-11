import type { Metadata } from "next";
import {
  INSTRUCTOR_NAME,
  SHOW_INSTRUCTOR_NAME,
} from "./instructor-display";
import { absoluteUrl, siteUrl } from "./site-url";

const DEFAULT_TITLE = "از یادگیری کد تا درک مهندسی";
const DEFAULT_DESCRIPTION =
  "دانش فناوری را عمیق یاد بگیر، واقعی بساز و حرفه‌ای رشد کن. دوره، مسیر و تمرین واقعی برای مهندسان و علاقه‌مندان.";

export const siteMetadataBase = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
};

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  imagePath?: string | null;
  kind?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authors?: string[];
}): Metadata {
  const url = absoluteUrl(input.path);
  const image = input.imagePath
    ? input.imagePath.startsWith("http")
      ? input.imagePath
      : absoluteUrl(input.imagePath)
    : absoluteUrl("/artwork/courses/clean-architecture.svg");
  const description =
    input.description.trim() || siteMetadataBase.description;
  const isArticle = input.kind === "article";

  return {
    title: input.title,
    description,
    alternates: input.noIndex ? undefined : { canonical: url },
    robots: input.noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
    authors: (
      input.authors ??
      (isArticle && SHOW_INSTRUCTOR_NAME ? [INSTRUCTOR_NAME] : undefined)
    )?.map((name) => ({ name })),
    openGraph: {
      type: isArticle ? "article" : "website",
      locale: "fa_IR",
      url,
      siteName: "DXCode",
      title: input.title,
      description,
      images: [{ url: image, alt: input.title }],
      ...(isArticle
        ? {
            publishedTime: input.publishedTime ?? undefined,
            modifiedTime:
              input.modifiedTime ?? input.publishedTime ?? undefined,
            authors:
              input.authors ??
              (SHOW_INSTRUCTOR_NAME ? [INSTRUCTOR_NAME] : undefined),
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [image],
    },
    metadataBase: new URL(siteUrl()),
  };
}

export function privateMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false, nocache: true },
  };
}
