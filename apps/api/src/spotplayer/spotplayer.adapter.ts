import { Injectable } from "@nestjs/common";
import {
  DEFAULT_LICENSE_ENDPOINT,
  type CreateLicenseInput,
  type CreateLicenseResult,
  type SpotPlayerAdapter,
  type SpotPlayerIntegrationStatus,
} from "./spotplayer.types";

/**
 * Official SpotPlayer license API adapter.
 * Docs: https://spotplayer.ir/help/api
 * Never invents license keys — only returns success when provider JSON has _id + key.
 */
@Injectable()
export class SpotPlayerHttpAdapter implements SpotPlayerAdapter {
  constructor(private readonly resolveApiKey: () => string | null) {}

  hasCredentials(): boolean {
    return Boolean(this.resolveApiKey()?.trim());
  }

  integrationStatus(technicalEnabled: boolean): SpotPlayerIntegrationStatus {
    if (!technicalEnabled) return "DISABLED";
    if (!this.hasCredentials()) return "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED";
    return "IMPLEMENTED";
  }

  async createLicense(input: CreateLicenseInput): Promise<CreateLicenseResult> {
    const apiKey = this.resolveApiKey()?.trim();
    if (!apiKey) {
      return {
        ok: false,
        reason: "SpotPlayer API key missing (IMPLEMENTED_BUT_CREDENTIALS_REQUIRED).",
        integrationStatus: "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED",
      };
    }

    if (!input.courseIds.length) {
      return { ok: false, reason: "SpotPlayer course id mapping is required." };
    }
    if (!input.name.trim()) {
      return { ok: false, reason: "License name is required." };
    }
    if (!input.watermarkTexts.length || !input.watermarkTexts[0]?.trim()) {
      return {
        ok: false,
        reason: "Watermark text is required (official API: watermark.texts.text).",
      };
    }

    const endpoint =
      process.env.SPOTPLAYER_LICENSE_ENDPOINT?.trim() ||
      DEFAULT_LICENSE_ENDPOINT;

    const body = {
      test: input.test,
      course: input.courseIds,
      name: input.name.trim(),
      watermark: {
        texts: input.watermarkTexts
          .filter((t) => t?.trim())
          .map((text) => ({ text: text.trim() })),
      },
      ...(input.payload ? { payload: input.payload } : {}),
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          $API: apiKey,
          $LEVEL: "-1",
        },
        body: JSON.stringify(body),
      });

      const rawText = await res.text();
      let raw: unknown = rawText;
      try {
        raw = JSON.parse(rawText) as unknown;
      } catch {
        /* keep text */
      }

      if (!res.ok) {
        const msg =
          typeof raw === "object" &&
          raw &&
          "ex" in raw &&
          typeof (raw as { ex?: { msg?: string } }).ex?.msg === "string"
            ? (raw as { ex: { msg: string } }).ex.msg
            : `SpotPlayer HTTP ${res.status}`;
        return { ok: false, reason: msg, raw };
      }

      if (
        typeof raw !== "object" ||
        raw === null ||
        !("_id" in raw) ||
        !("key" in raw)
      ) {
        return {
          ok: false,
          reason:
            "SpotPlayer response missing _id/key — refusing to invent a license.",
          raw,
        };
      }

      const licenseId = String((raw as { _id: unknown })._id ?? "");
      const licenseKey = String((raw as { key: unknown }).key ?? "");
      const licenseUrl = String((raw as { url?: unknown }).url ?? "");

      if (!licenseId || !licenseKey) {
        return {
          ok: false,
          reason:
            "SpotPlayer returned empty _id/key — refusing to invent a license.",
          raw,
        };
      }

      return {
        ok: true,
        licenseId,
        licenseKey,
        licenseUrl,
        raw,
      };
    } catch (err) {
      return {
        ok: false,
        reason:
          err instanceof Error
            ? err.message
            : "SpotPlayer network error",
      };
    }
  }
}

/**
 * Test-only adapter. Still requires an explicit createLicense call —
 * never auto-succeeds. Enabled only when SPOTPLAYER_MOCK_HOOKS=true.
 */
export class MockSpotPlayerAdapter implements SpotPlayerAdapter {
  private calls = 0;

  hasCredentials(): boolean {
    return true;
  }

  integrationStatus(technicalEnabled: boolean): SpotPlayerIntegrationStatus {
    if (!technicalEnabled) return "DISABLED";
    return "IMPLEMENTED";
  }

  async createLicense(input: CreateLicenseInput): Promise<CreateLicenseResult> {
    this.calls += 1;
    if (!input.courseIds.length || !input.name || !input.watermarkTexts[0]) {
      return { ok: false, reason: "Missing required license fields (mock)." };
    }
    if (process.env.SPOTPLAYER_MOCK_FAIL === "true") {
      return { ok: false, reason: "Mock SpotPlayer forced failure.", raw: { mock: true } };
    }
    const id = `mock_lic_${this.calls}_${Date.now()}`;
    return {
      ok: true,
      licenseId: id,
      licenseKey: `mock-key-${id}`,
      licenseUrl: `/${id}/mock/`,
      raw: { _id: id, key: `mock-key-${id}`, url: `/${id}/mock/`, mock: true },
    };
  }
}
