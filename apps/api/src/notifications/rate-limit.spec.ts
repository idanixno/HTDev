import { describe, expect, it, beforeEach } from "vitest";
import {
  checkNotifyRateLimit,
  resetNotifyRateLimitForTests,
} from "./rate-limit";

describe("notification rate limit", () => {
  beforeEach(() => {
    resetNotifyRateLimitForTests();
  });

  it("allows up to max then blocks", () => {
    const cfg = { max: 2, windowMs: 60_000 };
    expect(checkNotifyRateLimit("u1:EMAIL", cfg).allowed).toBe(true);
    expect(checkNotifyRateLimit("u1:EMAIL", cfg).allowed).toBe(true);
    expect(checkNotifyRateLimit("u1:EMAIL", cfg).allowed).toBe(false);
  });

  it("isolates keys", () => {
    const cfg = { max: 1, windowMs: 60_000 };
    expect(checkNotifyRateLimit("a:SMS", cfg).allowed).toBe(true);
    expect(checkNotifyRateLimit("b:SMS", cfg).allowed).toBe(true);
    expect(checkNotifyRateLimit("a:SMS", cfg).allowed).toBe(false);
  });
});
