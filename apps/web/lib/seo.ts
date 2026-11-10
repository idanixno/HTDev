import type { Metadata } from "next";
import { absoluteUrl, siteUrl } from "./site-url";

const DEFAULT_TITLE = "ژرفا | اطلس یادگیری عمیق";
const DEFAULT_DESCRIPTION =
  "اطلس یادگیریِ آرمان راد؛ از اولین مسئله تا تصمیم‌های معماری. مسیرت را با پیش‌نیاز روشن و تمرین واقعی بساز.";

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
}): Metadata {
  const url = absoluteUrl(input.path);
  const image = input.imagePath
    ? input.imagePath.startsWith("http")
      ? input.imagePath
      : absoluteUrl(input.imagePath)
    : absoluteUrl("/artwork/courses/clean-architecture.svg");
  const description =
    input.description.trim() || siteMetadataBase.description;

  return {
    title: input.title,
    description,
    alternates: input.noIndex ? undefined : { canonical: url },
    robots: input.noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
    openGraph: {
      type: input.kind === "article" ? "article" : "website",
      locale: "fa_IR",
      url,
      siteName: "ژرفا",
      title: input.title,
      description,
      images: [{ url: image, alt: input.title }],
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
