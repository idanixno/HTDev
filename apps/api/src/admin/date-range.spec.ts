import { describe, expect, it } from "vitest";
import {
  eachUtcDay,
  parseUtcDateOnly,
  resolveDateRange,
  startOfUtcDay,
  utcDayKey,
} from "./date-range";

describe("resolveDateRange", () => {
  it("defaults to last 30 UTC days inclusive", () => {
    const now = new Date("2026-11-06T15:30:00.000Z");
    const range = resolveDateRange({ now });
    expect(utcDayKey(range.from)).toBe("2026-10-08");
    expect(utcDayKey(range.to)).toBe("2026-11-06");
    expect(eachUtcDay(range.from, range.to)).toHaveLength(30);
  });

  it("parses explicit from/to", () => {
    const range = resolveDateRange({ from: "2026-11-01", to: "2026-11-03" });
    expect(range.from.toISOString()).toBe("2026-11-01T00:00:00.000Z");
    expect(range.to.toISOString()).toBe("2026-11-03T23:59:59.999Z");
    expect(eachUtcDay(range.from, range.to)).toEqual([
      "2026-11-01",
      "2026-11-02",
      "2026-11-03",
    ]);
  });

  it("rejects inverted range", () => {
    expect(() =>
      resolveDateRange({ from: "2026-11-10", to: "2026-11-01" }),
    ).toThrow(/from must be/);
  });

  it("rejects invalid date strings", () => {
    expect(() => parseUtcDateOnly("11-06-2026")).toThrow(/Invalid date/);
    expect(() => parseUtcDateOnly("2026-13-01")).toThrow(/Invalid date/);
  });
});

describe("startOfUtcDay", () => {
  it("zeros time components", () => {
    const d = startOfUtcDay(new Date("2026-05-01T18:22:11.123Z"));
    expect(d.toISOString()).toBe("2026-05-01T00:00:00.000Z");
  });
});
