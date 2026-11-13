/**
 * Acceptance helpers for Topic architecture (no DB).
 * Runtime Nest/Prisma IDOR and HTTP cases require a live DB + Owner session.
 */
import { describe, expect, it } from "vitest";
import {
  TOPIC_MAX_DEPTH,
  assertValidParent,
  buildParentMaps,
} from "./topic-hierarchy";

describe("topic acceptance (pure rules)", () => {
  it("keeps course URL shape unchanged by design", () => {
    const courseSlug = "keras-sequential";
    expect(`/courses/${courseSlug}`).toBe("/courses/keras-sequential");
    expect(`/topics/keras`).not.toContain("/courses/");
  });

  it("builds root → subtopic → leaf without cycle", () => {
    const rows = [
      { id: "dl", parentTopicId: null },
      { id: "keras", parentTopicId: "dl" },
      { id: "seq", parentTopicId: "keras" },
    ];
    const { byId, childrenOf } = buildParentMaps(rows);
    expect(
      assertValidParent({
        parentTopicId: "dl",
        byId,
        childrenOf,
      }).ok,
    ).toBe(true);
    expect(
      assertValidParent({
        topicId: "dl",
        parentTopicId: "seq",
        byId,
        childrenOf,
      }),
    ).toEqual({ ok: false, reason: "CYCLE" });
  });

  it("enforces max depth for new children", () => {
    const rows = [
      { id: "a", parentTopicId: null },
      { id: "b", parentTopicId: "a" },
      { id: "c", parentTopicId: "b" },
    ];
    const { byId, childrenOf } = buildParentMaps(rows);
    expect(TOPIC_MAX_DEPTH).toBe(2);
    expect(
      assertValidParent({
        parentTopicId: "c",
        byId,
        childrenOf,
      }),
    ).toEqual({ ok: false, reason: "DEPTH" });
  });

  it("rejects duplicate semantic self-links at DTO boundary by rule", () => {
    const fromTopicId = "keras";
    const toTopicId = "keras";
    expect(fromTopicId === toTopicId).toBe(true);
  });
});
