import { describe, expect, it } from "vitest";
import { SpotPlayerLicenseStatus } from "@zharfa/database";
import {
  accessIdempotencyKey,
  canRetryProvisioning,
  describeAccessAxes,
  shouldSkipProvisioning,
} from "./provisioning-logic";

describe("provisioning-logic", () => {
  it("builds stable idempotency keys per user+course", () => {
    expect(accessIdempotencyKey("u1", "c1")).toBe("access:u1:c1");
    expect(accessIdempotencyKey("u1", "c1")).toBe(
      accessIdempotencyKey("u1", "c1"),
    );
    expect(accessIdempotencyKey("u1", "c1")).not.toBe(
      accessIdempotencyKey("u1", "c2"),
    );
  });

  it("skips only when SUCCEEDED with a real key", () => {
    expect(
      shouldSkipProvisioning(SpotPlayerLicenseStatus.SUCCEEDED, "real-key"),
    ).toBe(true);
    expect(
      shouldSkipProvisioning(SpotPlayerLicenseStatus.SUCCEEDED, null),
    ).toBe(false);
    expect(
      shouldSkipProvisioning(SpotPlayerLicenseStatus.SUCCEEDED, "  "),
    ).toBe(false);
    expect(
      shouldSkipProvisioning(SpotPlayerLicenseStatus.QUEUED, "real-key"),
    ).toBe(false);
    expect(
      shouldSkipProvisioning(SpotPlayerLicenseStatus.FAILED, null),
    ).toBe(false);
  });

  it("allows retry from failed/pending/queued", () => {
    expect(canRetryProvisioning(SpotPlayerLicenseStatus.FAILED)).toBe(true);
    expect(canRetryProvisioning(SpotPlayerLicenseStatus.PENDING)).toBe(true);
    expect(canRetryProvisioning(SpotPlayerLicenseStatus.QUEUED)).toBe(true);
    expect(canRetryProvisioning(SpotPlayerLicenseStatus.SUCCEEDED)).toBe(
      false,
    );
    expect(canRetryProvisioning(SpotPlayerLicenseStatus.IN_PROGRESS)).toBe(
      false,
    );
  });

  it("keeps payment and provisioning axes independent", () => {
    const paidButPending = describeAccessAxes({
      orderPaid: true,
      licenseStatus: SpotPlayerLicenseStatus.PENDING,
    });
    expect(paidButPending.payment).toBe("PAID");
    expect(paidButPending.accessReady).toBe(false);

    const unpaidButSomehowSucceeded = describeAccessAxes({
      orderPaid: false,
      licenseStatus: SpotPlayerLicenseStatus.SUCCEEDED,
    });
    expect(unpaidButSomehowSucceeded.payment).toBe("NOT_PAID");
    expect(unpaidButSomehowSucceeded.accessReady).toBe(true);
  });
});
