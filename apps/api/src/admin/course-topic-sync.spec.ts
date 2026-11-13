/**
 * Documents CourseTopic / JournalTopic PATCH contract used by AdminService.
 * HTTP matrix in Phase 2.6 audit covers live DB sync.
 */
import { describe, expect, it } from "vitest";

/** Mirrors AdminService providedKeys fallback for topicIds. */
function decideTopicSync(input: {
  id?: string;
  providedKeys?: string[];
  dtoKeys?: string[];
  dtoTopicIds?: string[];
}) {
  const keys = new Set(
    input.providedKeys ??
      (input.dtoKeys ?? []).concat(input.id ? [] : ["topicIds"]),
  );
  if (!keys.has("topicIds")) return { action: "preserve" as const };
  return {
    action: "replace" as const,
    topicIds: input.dtoTopicIds ?? [],
  };
}

describe("course/article topicIds PATCH contract", () => {
  it("omitted topicIds preserves relations on update", () => {
    expect(
      decideTopicSync({
        id: "c1",
        providedKeys: ["slug", "title", "publicationStatus"],
      }),
    ).toEqual({ action: "preserve" });
  });

  it("empty topicIds clears all relations", () => {
    expect(
      decideTopicSync({
        id: "c1",
        providedKeys: ["topicIds"],
        dtoTopicIds: [],
      }),
    ).toEqual({ action: "replace", topicIds: [] });
  });

  it("non-empty topicIds replaces set", () => {
    expect(
      decideTopicSync({
        id: "c1",
        providedKeys: ["topicIds"],
        dtoTopicIds: ["a", "b"],
      }),
    ).toEqual({ action: "replace", topicIds: ["a", "b"] });
  });

  it("create without providedKeys still syncs topicIds (default [])", () => {
    expect(
      decideTopicSync({
        dtoKeys: ["slug", "title"],
        dtoTopicIds: undefined,
      }),
    ).toEqual({ action: "replace", topicIds: [] });
  });

  it("update without providedKeys and without topicIds key preserves", () => {
    expect(
      decideTopicSync({
        id: "c1",
        dtoKeys: ["slug", "title"],
      }),
    ).toEqual({ action: "preserve" });
  });
});
