import { describe, expect, it } from "vitest";
import { CouponDiscountType } from "@zharfa/database";
import { applyCoupon, normalizeCouponCode } from "./coupon-math";

const base = {
  active: true,
  redemptionCount: 0,
  startsAt: null,
  endsAt: null,
  maxRedemptions: null,
  minOrderToman: null,
  maxDiscountToman: null,
};

describe("coupon math", () => {
  it("applies percent discount with half-up toman rounding", () => {
    const result = applyCoupon(1_000_000, {
      ...base,
      discountType: CouponDiscountType.PERCENT,
      percentOff: 12.5,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.discountToman.toNumber()).toBe(125_000);
    expect(result.amountToman.toNumber()).toBe(875_000);
  });

  it("applies fixed toman discount capped at list price", () => {
    const result = applyCoupon(50_000, {
      ...base,
      discountType: CouponDiscountType.FIXED_TOMAN,
      amountOffToman: 80_000,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.discountToman.toNumber()).toBe(50_000);
    expect(result.amountToman.toNumber()).toBe(0);
  });

  it("respects maxDiscountToman on percent coupons", () => {
    const result = applyCoupon(1_000_000, {
      ...base,
      discountType: CouponDiscountType.PERCENT,
      percentOff: 50,
      maxDiscountToman: 100_000,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.discountToman.toNumber()).toBe(100_000);
    expect(result.amountToman.toNumber()).toBe(900_000);
  });

  it("rejects inactive / expired / under-minimum / exhausted coupons", () => {
    expect(
      applyCoupon(10_000, {
        ...base,
        discountType: CouponDiscountType.FIXED_TOMAN,
        amountOffToman: 1_000,
        active: false,
      }).ok,
    ).toBe(false);

    expect(
      applyCoupon(10_000, {
        ...base,
        discountType: CouponDiscountType.FIXED_TOMAN,
        amountOffToman: 1_000,
        endsAt: new Date("2020-01-01"),
      }).ok,
    ).toBe(false);

    expect(
      applyCoupon(5_000, {
        ...base,
        discountType: CouponDiscountType.FIXED_TOMAN,
        amountOffToman: 1_000,
        minOrderToman: 10_000,
      }).ok,
    ).toBe(false);

    expect(
      applyCoupon(20_000, {
        ...base,
        discountType: CouponDiscountType.FIXED_TOMAN,
        amountOffToman: 1_000,
        maxRedemptions: 2,
        redemptionCount: 2,
      }).ok,
    ).toBe(false);
  });

  it("normalizes coupon codes case-insensitively", () => {
    expect(normalizeCouponCode("  deep20 ")).toBe("DEEP20");
  });
});
