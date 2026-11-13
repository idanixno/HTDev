/**
 * Topic tree rules (independent of Category).
 * - Max depth from root: TOPIC_MAX_DEPTH (root = 0)
 * - No cycles: a topic cannot be its own ancestor/descendant
 * - Parent delete uses DB Restrict — children must be reparented first
 */

export const TOPIC_MAX_DEPTH = 2; // root → child → grandchild (3 levels)

export type TopicParentRow = {
  id: string;
  parentTopicId: string | null;
};

/**
 * Walk ancestors of `startParentId` and return depth of a node that would
 * attach under that parent (0 if parent is null).
 */
export function depthUnderParent(
  startParentId: string | null,
  byId: Map<string, TopicParentRow>,
): number {
  if (!startParentId) return 0;
  let depth = 1;
  let current: string | null = startParentId;
  const seen = new Set<string>();
  while (current) {
    if (seen.has(current)) {
      throw new Error("CYCLE");
    }
    seen.add(current);
    const row = byId.get(current);
    if (!row) break;
    current = row.parentTopicId;
    if (current) depth += 1;
  }
  return depth;
}

/** True if `candidateParentId` is `topicId` or any descendant of `topicId`. */
export function wouldCreateCycle(
  topicId: string,
  candidateParentId: string | null,
  byId: Map<string, TopicParentRow>,
  childrenOf: Map<string, string[]>,
): boolean {
  if (!candidateParentId) return false;
  if (candidateParentId === topicId) return true;

  const subtree = new Set<string>();
  const stack = [topicId];
  while (stack.length) {
    const id = stack.pop()!;
    if (subtree.has(id)) continue;
    subtree.add(id);
    for (const child of childrenOf.get(id) ?? []) {
      stack.push(child);
    }
  }
  return subtree.has(candidateParentId);
}

export function assertValidParent(input: {
  topicId?: string;
  parentTopicId: string | null;
  byId: Map<string, TopicParentRow>;
  childrenOf: Map<string, string[]>;
  maxDepth?: number;
}): { ok: true } | { ok: false; reason: "CYCLE" | "DEPTH" | "MISSING_PARENT" } {
  const maxDepth = input.maxDepth ?? TOPIC_MAX_DEPTH;
  const parentId = input.parentTopicId;
  if (!parentId) return { ok: true };

  if (!input.byId.has(parentId)) {
    return { ok: false, reason: "MISSING_PARENT" };
  }

  if (
    input.topicId &&
    wouldCreateCycle(input.topicId, parentId, input.byId, input.childrenOf)
  ) {
    return { ok: false, reason: "CYCLE" };
  }

  try {
    const depth = depthUnderParent(parentId, input.byId);
    if (depth > maxDepth) {
      return { ok: false, reason: "DEPTH" };
    }
  } catch {
    return { ok: false, reason: "CYCLE" };
  }

  return { ok: true };
}

export function buildParentMaps(
  rows: TopicParentRow[],
): {
  byId: Map<string, TopicParentRow>;
  childrenOf: Map<string, string[]>;
} {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const childrenOf = new Map<string, string[]>();
  for (const row of rows) {
    if (!row.parentTopicId) continue;
    const list = childrenOf.get(row.parentTopicId) ?? [];
    list.push(row.id);
    childrenOf.set(row.parentTopicId, list);
  }
  return { byId, childrenOf };
}
