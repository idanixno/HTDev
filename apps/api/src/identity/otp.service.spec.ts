import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";

/**
 * Unit coverage for OTP hashing/verification semantics without Prisma.
 * Mirrors OtpService.hashCode / verifyCodeHash logic.
 */

function hashOtp(code: string, pepper: string): string {
  return createHash("sha256").update(`${pepper}:${code}`).digest("hex");
}

describe("OTP hash semantics", () => {
  const pepper = "test-pepper";

  it("is deterministic for the same code+pepper", () => {
    expect(hashOtp("123456", pepper)).toBe(hashOtp("123456", pepper));
  });

  it("differs across codes", () => {
    expect(hashOtp("123456", pepper)).not.toBe(hashOtp("654321", pepper));
  });

  it("never stores plaintext equality", () => {
    const code = "482910";
    const digest = hashOtp(code, pepper);
    expect(digest).not.toContain(code);
    expect(digest).toHaveLength(64);
  });

  it("pads generated codes to 6 digits", () => {
    const n = 42;
    const code = String(n).padStart(6, "0");
    expect(code).toBe("000042");
    expect(code).toHaveLength(6);
  });
});
