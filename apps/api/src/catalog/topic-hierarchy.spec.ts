import { describe, expect, it } from "vitest";
import {
  TOPIC_MAX_DEPTH,
  assertValidParent,
  buildParentMaps,
  depthUnderParent,
  wouldCreateCycle,
} from "./topic-hierarchy";

describe("topic hierarchy", () => {
  const rows = [
    { id: "root", parentTopicId: null },
    { id: "keras", parentTopicId: "root" },
    { id: "seq", parentTopicId: "keras" },
  ];
  const { byId, childrenOf } = buildParentMaps(rows);

  it("computes depth under parent", () => {
    expect(depthUnderParent(null, byId)).toBe(0);
    expect(depthUnderParent("root", byId)).toBe(1);
    expect(depthUnderParent("keras", byId)).toBe(2);
    expect(depthUnderParent("seq", byId)).toBe(3);
  });

  it("allows root and mid-level parents within max depth", () => {
    expect(
      assertValidParent({
        parentTopicId: null,
        byId,
        childrenOf,
      }),
    ).toEqual({ ok: true });
    expect(
      assertValidParent({
        parentTopicId: "root",
        byId,
        childrenOf,
      }),
    ).toEqual({ ok: true });
    expect(
      assertValidParent({
        parentTopicId: "keras",
        byId,
        childrenOf,
      }),
    ).toEqual({ ok: true });
  });

  it("rejects parent deeper than max depth", () => {
    expect(TOPIC_MAX_DEPTH).toBe(2);
    expect(
      assertValidParent({
        parentTopicId: "seq",
        byId,
        childrenOf,
      }),
    ).toEqual({ ok: false, reason: "DEPTH" });
  });

  it("rejects self-parent and descendant-as-parent", () => {
    expect(wouldCreateCycle("root", "root", byId, childrenOf)).toBe(true);
    expect(wouldCreateCycle("root", "seq", byId, childrenOf)).toBe(true);
    expect(wouldCreateCycle("keras", "root", byId, childrenOf)).toBe(false);
    expect(
      assertValidParent({
        topicId: "root",
        parentTopicId: "keras",
        byId,
        childrenOf,
      }),
    ).toEqual({ ok: false, reason: "CYCLE" });
  });

  it("rejects missing parent", () => {
    expect(
      assertValidParent({
        parentTopicId: "nope",
        byId,
        childrenOf,
      }),
    ).toEqual({ ok: false, reason: "MISSING_PARENT" });
  });
});
