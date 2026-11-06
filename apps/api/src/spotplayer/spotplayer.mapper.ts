import {
  SpotPlayerLicenseStatus,
  type SpotPlayerLicense,
  type Course,
} from "@zharfa/database";
import { DL_BASE, SPOTPLAYER_PLATFORM_SUPPORT } from "./spotplayer.types";
import { maskSecret } from "./credential-crypto";

export function toPublicLicense(
  row: SpotPlayerLicense & {
    course?: Pick<Course, "id" | "slug" | "title" | "coverAsset" | "offerKind">;
  },
) {
  const succeeded = row.status === SpotPlayerLicenseStatus.SUCCEEDED;
  return {
    id: row.id,
    courseId: row.courseId,
    course: row.course
      ? {
          id: row.course.id,
          slug: row.course.slug,
          title: row.course.title,
          coverAsset: row.course.coverAsset,
          offerKind: row.course.offerKind,
        }
      : undefined,
    orderId: row.orderId,
    accessSource: row.accessSource,
    status: row.status,
    /** Full key only when provisioned by provider — never invented. */
    licenseKey: succeeded ? row.licenseKey : null,
    licenseUrl: succeeded && row.licenseUrl ? `${DL_BASE}${row.licenseUrl}` : null,
    spotPlayerLicenseId: succeeded ? row.spotPlayerLicenseId : null,
    attemptCount: row.attemptCount,
    lastError: row.status === SpotPlayerLicenseStatus.FAILED ? row.lastError : null,
    provisionedAt: row.provisionedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toAdminLicense(
  row: SpotPlayerLicense & {
    course?: Pick<Course, "id" | "slug" | "title" | "coverAsset" | "offerKind">;
    user?: { id: string; username: string; email: string; displayName: string };
  },
) {
  return {
    ...toPublicLicense(row),
    user: row.user
      ? {
          id: row.user.id,
          username: row.user.username,
          email: row.user.email,
          displayName: row.user.displayName,
        }
      : undefined,
    lastError: row.lastError,
    lastAttemptAt: row.lastAttemptAt?.toISOString() ?? null,
    idempotencyKey: row.idempotencyKey,
    /** Masked key preview for diagnostics — never full secret in list. */
    licenseKeyMasked: maskSecret(row.licenseKey),
    providerPayloadPresent: row.providerPayload != null,
  };
}

export function studentAccessInstructions() {
  const platforms = SPOTPLAYER_PLATFORM_SUPPORT;
  return {
    playerDownloadHint:
      "پخش‌کننده را از سایت رسمی اسپات‌پلیر دریافت کنید: https://spotplayer.ir/",
    confirmedPlatforms: (
      [
        ["windows", platforms.windows],
        ["macos", platforms.macos],
        ["android", platforms.android],
        ["web", platforms.web],
      ] as const
    )
      .filter(([, p]) => p.available)
      .map(([id, p]) => ({
        id,
        available: true as const,
        version: "version" in p ? p.version : undefined,
        source: p.source,
      })),
    notYetAvailable: (
      [
        ["ios", platforms.ios],
        ["ubuntu", platforms.ubuntu],
      ] as const
    ).map(([id, p]) => ({
      id,
      available: false as const,
      note: p.note,
      source: p.source,
    })),
    steps: [
      "پس از صدور موفق لایسنس، کلید را در اپلیکیشن اسپات‌پلیر وارد کنید.",
      "فقط پلتفرم‌هایی که در سایت رسمی در دسترس اعلام شده‌اند را نصب کنید.",
      "نسخه iOS و Ubuntu در سایت رسمی «به‌زودی» هستند — راهنمای نصب برای آن‌ها ارائه نمی‌شود.",
    ],
    docsUrl: "https://spotplayer.ir/help/api",
    siteUrl: "https://spotplayer.ir/",
  };
}
