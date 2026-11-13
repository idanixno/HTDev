import { revalidatePath } from "next/cache";

/** Bust public Topic hub + index + sitemap after admin mutations. */
export function revalidateTopicSurfaces(slug?: string | null) {
  revalidatePath("/topics");
  revalidatePath("/topics", "layout");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidatePath(`/topics/${slug}`);
  }
}

/**
 * After Course/Journal topic link changes: hub indexes, catalog, and journal
 * surfaces may show stale membership until the catalog ISR window expires.
 */
export function revalidateAfterTopicLinkChange() {
  revalidateTopicSurfaces();
  revalidatePath("/courses");
  revalidatePath("/courses", "layout");
  revalidatePath("/journal");
  revalidatePath("/journal", "layout");
}

function bodyHasTopicIds(raw: string | undefined): boolean {
  if (!raw) return false;
  try {
    const body = JSON.parse(raw) as Record<string, unknown>;
    return Object.prototype.hasOwnProperty.call(body, "topicIds");
  } catch {
    return false;
  }
}

/** Peek request JSON for topicIds without consuming the body stream twice. */
export async function peekTopicIdsInRequest(
  request: Request,
): Promise<{ bodyText: string; hasTopicIds: boolean }> {
  const bodyText = await request.text();
  return { bodyText, hasTopicIds: bodyHasTopicIds(bodyText) };
}
