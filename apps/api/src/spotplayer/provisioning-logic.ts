import { SpotPlayerLicenseStatus } from "@zharfa/database";

/**
 * Pure helpers for provisioning state / idempotency — unit-tested without Redis.
 */

export function accessIdempotencyKey(userId: string, courseId: string): string {
  return `access:${userId}:${courseId}`;
}

export function shouldSkipProvisioning(
  status: SpotPlayerLicenseStatus,
  licenseKey: string | null | undefined,
): boolean {
  return (
    status === SpotPlayerLicenseStatus.SUCCEEDED && Boolean(licenseKey?.trim())
  );
}

export function canRetryProvisioning(status: SpotPlayerLicenseStatus): boolean {
  return (
    status === SpotPlayerLicenseStatus.FAILED ||
    status === SpotPlayerLicenseStatus.PENDING ||
    status === SpotPlayerLicenseStatus.QUEUED
  );
}

/** Payment PAID vs license SUCCEEDED are independent axes. */
export function describeAccessAxes(input: {
  orderPaid: boolean;
  licenseStatus: SpotPlayerLicenseStatus;
}): {
  payment: "PAID" | "NOT_PAID";
  provisioning: SpotPlayerLicenseStatus;
  accessReady: boolean;
} {
  return {
    payment: input.orderPaid ? "PAID" : "NOT_PAID",
    provisioning: input.licenseStatus,
    accessReady: input.licenseStatus === SpotPlayerLicenseStatus.SUCCEEDED,
  };
}
