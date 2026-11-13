import type { TopicOption } from "../components/admin/topic-multi-select";
import {
  fetchAdminTopicOptions,
  type AdminTopicListItem,
} from "./admin";

export function mapAdminTopicsToOptions(
  items: AdminTopicListItem[],
): TopicOption[] {
  return items.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    status: t.status,
    parentTopicId: t.parent?.id ?? null,
    parentName: t.parent?.name ?? null,
  }));
}

export async function loadTopicOptionsForEditors(): Promise<TopicOption[]> {
  const items = await fetchAdminTopicOptions();
  if (!items) return [];
  return mapAdminTopicsToOptions(items);
}
