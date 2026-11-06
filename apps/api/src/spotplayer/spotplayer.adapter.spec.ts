import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MockSpotPlayerAdapter,
  SpotPlayerHttpAdapter,
} from "./spotplayer.adapter";

describe("SpotPlayerHttpAdapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SPOTPLAYER_LICENSE_ENDPOINT;
  });

  it("reports credentials required when key missing", () => {
    const adapter = new SpotPlayerHttpAdapter(() => null);
    expect(adapter.hasCredentials()).toBe(false);
    expect(adapter.integrationStatus(true)).toBe(
      "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED",
    );
    expect(adapter.integrationStatus(false)).toBe("DISABLED");
  });

  it("refuses to invent success when provider omits key", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ _id: "abc" }),
      })),
    );
    const adapter = new SpotPlayerHttpAdapter(() => "test-api-key");
    const result = await adapter.createLicense({
      courseIds: ["course1"],
      name: "Sara",
      watermarkTexts: ["09121111111"],
      test: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/missing _id\/key|invent/i);
    }
  });

  it("returns provider key only when _id and key present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            _id: "5dcab540796f5d4d48a6570f",
            key: "provider-issued-key",
            url: "/lic/path/",
          }),
      })),
    );
    const adapter = new SpotPlayerHttpAdapter(() => "test-api-key");
    const result = await adapter.createLicense({
      courseIds: ["5d2ee35bcddc092a304ae5eb"],
      name: "Sara",
      watermarkTexts: ["09121111111"],
      test: true,
      payload: "order-1",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.licenseKey).toBe("provider-issued-key");
      expect(result.licenseId).toBe("5dcab540796f5d4d48a6570f");
      expect(result.licenseUrl).toBe("/lic/path/");
    }
    expect(fetch).toHaveBeenCalledWith(
      "https://panel.spotplayer.ir/license/edit/",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          $API: "test-api-key",
          $LEVEL: "-1",
        }),
      }),
    );
  });
});

describe("MockSpotPlayerAdapter", () => {
  afterEach(() => {
    delete process.env.SPOTPLAYER_MOCK_FAIL;
  });

  it("issues a key only via explicit createLicense (test hook)", async () => {
    const adapter = new MockSpotPlayerAdapter();
    const result = await adapter.createLicense({
      courseIds: ["c1"],
      name: "Test",
      watermarkTexts: ["09120000000"],
      test: true,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.licenseKey.startsWith("mock-key-")).toBe(true);
    }
  });

  it("can force failure without inventing success", async () => {
    process.env.SPOTPLAYER_MOCK_FAIL = "true";
    const adapter = new MockSpotPlayerAdapter();
    const result = await adapter.createLicense({
      courseIds: ["c1"],
      name: "Test",
      watermarkTexts: ["09120000000"],
      test: true,
    });
    expect(result.ok).toBe(false);
  });
});
