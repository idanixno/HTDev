import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, maskSecret } from "./credential-crypto";

describe("credential-crypto", () => {
  it("round-trips secrets", () => {
    const plain = "YhD5yX/9FQzVTg+c6YHQ7gCtZAs=";
    const enc = encryptSecret(plain);
    expect(enc).not.toContain(plain);
    expect(decryptSecret(enc)).toBe(plain);
  });

  it("masks secrets for API responses", () => {
    expect(maskSecret(null)).toBeNull();
    expect(maskSecret("abcd")).toBe("••••");
    expect(maskSecret("YhD5yX/9FQzVTg+c6YHQ7gCtZAs=")).toBe("••••••••ZAs=");
  });
});
