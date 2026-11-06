import { describe, expect, it } from "vitest";
import { PasswordService } from "./password.service";

describe("PasswordService (Argon2id)", () => {
  const service = new PasswordService();

  it("hashes and verifies", async () => {
    const hash = await service.hash("ChangeMeStudent!23");
    expect(hash.startsWith("$argon2id$")).toBe(true);
    expect(await service.verify(hash, "ChangeMeStudent!23")).toBe(true);
    expect(await service.verify(hash, "wrong-password")).toBe(false);
  });
});
