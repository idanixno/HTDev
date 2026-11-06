import { describe, expect, it } from "vitest";
import {
  classifyIdentifier,
  isValidEmail,
  isValidPhone,
  isValidUsername,
  normalizeEmail,
  normalizePhone,
  normalizeUsername,
} from "./normalization";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Sara@Example.COM ")).toBe("sara@example.com");
  });
});

describe("normalizePhone", () => {
  it("accepts local Iranian mobiles", () => {
    expect(normalizePhone("09121234567")).toBe("09121234567");
  });

  it("normalizes +98 and 0098 prefixes", () => {
    expect(normalizePhone("+98 912 123 4567")).toBe("09121234567");
    expect(normalizePhone("00989121234567")).toBe("09121234567");
    expect(normalizePhone("989121234567")).toBe("09121234567");
  });

  it("rejects invalid lengths", () => {
    expect(normalizePhone("091212345")).toBeNull();
    expect(normalizePhone("02188776655")).toBeNull();
    expect(isValidPhone("not-a-phone")).toBe(false);
  });
});

describe("normalizeUsername", () => {
  it("lowercases for uniqueness key", () => {
    expect(normalizeUsername("Sara_Dev")).toBe("sara_dev");
  });

  it("validates shape", () => {
    expect(isValidUsername("ab")).toBe(false);
    expect(isValidUsername("1abc")).toBe(false);
    expect(isValidUsername("sara_dev")).toBe(true);
  });
});

describe("classifyIdentifier", () => {
  it("detects email", () => {
    expect(classifyIdentifier("User@Site.ir")).toEqual({
      kind: "email",
      normalized: "user@site.ir",
    });
  });

  it("detects phone", () => {
    expect(classifyIdentifier("+989121234567")).toEqual({
      kind: "phone",
      normalized: "09121234567",
    });
  });

  it("detects username", () => {
    expect(classifyIdentifier("Niloofar")).toEqual({
      kind: "username",
      normalized: "niloofar",
    });
  });

  it("rejects empty / invalid", () => {
    expect(classifyIdentifier("")).toBeNull();
    expect(classifyIdentifier("bad@@")).toBeNull();
    expect(isValidEmail("nope")).toBe(false);
  });
});
