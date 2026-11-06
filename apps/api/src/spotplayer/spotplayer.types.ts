/**
 * SpotPlayer integration types.
 * Official docs: https://spotplayer.ir/help/api
 * Create license: POST https://panel.spotplayer.ir/license/edit/
 * Headers: $API (dashboard key), $LEVEL: -1
 * Required body: course[], name, watermark.texts[].text
 * Response: { _id, key, url }
 */

export type SpotPlayerIntegrationStatus =
  | "IMPLEMENTED"
  | "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED"
  | "DISABLED"
  | "DOCUMENTATION_UNAVAILABLE";

/** Official homepage platform matrix (spotplayer.ir, researched 2026-11-06). */
export const SPOTPLAYER_PLATFORM_SUPPORT = {
  windows: { available: true, version: "5.3.2.32", source: "https://spotplayer.ir/" },
  macos: { available: true, version: "5.3.2.32", source: "https://spotplayer.ir/" },
  ubuntu: { available: false, note: "بزودی (coming soon)", source: "https://spotplayer.ir/" },
  android: { available: true, version: "5.2.0.28", source: "https://spotplayer.ir/" },
  /** Official site lists iOS as coming soon — do not instruct students as if available. */
  ios: { available: false, note: "بزودی (coming soon)", source: "https://spotplayer.ir/" },
  web: { available: true, version: "5.0.3.24", source: "https://spotplayer.ir/" },
} as const;

export const DEFAULT_LICENSE_ENDPOINT =
  "https://panel.spotplayer.ir/license/edit/";

export const DL_BASE = "https://dl.spotplayer.ir";

export type CreateLicenseInput = {
  /** SpotPlayer course ObjectIds (official `course` array). */
  courseIds: string[];
  /** License holder display name. */
  name: string;
  /** Watermark text(s); typically student phone. */
  watermarkTexts: string[];
  /** Official `test` flag. */
  test: boolean;
  /** Optional payload echoed to support page (e.g. order id). */
  payload?: string;
};

export type CreateLicenseResult =
  | {
      ok: true;
      licenseId: string;
      licenseKey: string;
      licenseUrl: string;
      raw: unknown;
    }
  | {
      ok: false;
      reason: string;
      integrationStatus?: SpotPlayerIntegrationStatus;
      raw?: unknown;
    };

export interface SpotPlayerAdapter {
  hasCredentials(): boolean;
  integrationStatus(technicalEnabled: boolean): SpotPlayerIntegrationStatus;
  createLicense(input: CreateLicenseInput): Promise<CreateLicenseResult>;
}

export const ACCESS_PROVISIONING_JOB = "access-provisioning";
export const ZHARFA_JOBS_QUEUE = "zharfa-jobs";

export type AccessProvisioningJobData = {
  licenseId: string;
  /** Echo for logs/diagnostics; processing keys off licenseId. */
  idempotencyKey: string;
};
