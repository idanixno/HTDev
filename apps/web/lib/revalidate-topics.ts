import { revalidatePath } from "next/cache";

/** Bust public Topic hub + index + sitemap after admin mutations. */
export function revalidateTopicSurfaces(slug?: string | null) {
  revalidatePath("/topics");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidatePath(`/topics/${slug}`);
  }
}
