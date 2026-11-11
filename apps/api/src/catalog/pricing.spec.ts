import { CourseOfferKind, Prisma } from "@zharfa/database";
import { describe, expect, it } from "vitest";
import {
  assertCoherentPricing,
  formatTomanLabel,
  priceLabelForOffer,
  tomanIntegerForOrder,
} from "./pricing";

describe("pricing helpers", () => {
  it("formats under one million as هزارتومن (÷1000)", () => {
    expect(formatTomanLabel(300_000)).toBe("۳۰۰ هزارتومن");
    expect(formatTomanLabel(395_000)).toBe("۳۹۵ هزارتومن");
    expect(formatTomanLabel(3_000)).toBe("۳ هزارتومن");
    expect(formatTomanLabel(0)).toBe("۰ هزارتومن");
  });

  it("formats one million and above as میلیون تومن", () => {
    expect(formatTomanLabel(1_000_000)).toBe("۱ میلیون تومن");
    expect(formatTomanLabel(3_000_000)).toBe("۳ میلیون تومن");
    expect(formatTomanLabel(3_500_000)).toBe("۳٫۵ میلیون تومن");
    expect(formatTomanLabel(2_280_000)).toBe("۲٫۲۸ میلیون تومن");
    expect(formatTomanLabel(2_400_000)).toBe("۲٫۴ میلیون تومن");
  });

  it("rounds fractional Decimal prices before display scaling", () => {
    const label = formatTomanLabel(new Prisma.Decimal("1999.5"));
    expect(label).toBe("۲ هزارتومن");
  });

  it("maps offer kind to price labels", () => {
    expect(
      priceLabelForOffer({
        offerKind: CourseOfferKind.FREE,
        priceToman: 0,
      }),
    ).toBe("رایگان");
    expect(
      priceLabelForOffer({
        offerKind: CourseOfferKind.COMING_SOON,
        priceToman: 0,
      }),
    ).toBe("به‌زودی");
    expect(
      priceLabelForOffer({
        offerKind: CourseOfferKind.PAID,
        priceToman: 1_600_000,
      }),
    ).toBe("۱٫۶ میلیون تومن");
  });

  it("rounds Decimal list price to integer toman for orders", () => {
    expect(tomanIntegerForOrder(new Prisma.Decimal("1999.4"))).toBe(1999);
    expect(tomanIntegerForOrder(new Prisma.Decimal("1999.5"))).toBe(2000);
    expect(tomanIntegerForOrder("2400000")).toBe(2_400_000);
  });

  it("rejects incoherent FREE / PAID pricing", () => {
    expect(() =>
      assertCoherentPricing({
        offerKind: CourseOfferKind.FREE,
        priceToman: 100,
      }),
    ).toThrow(/FREE/);
    expect(() =>
      assertCoherentPricing({
        offerKind: CourseOfferKind.PAID,
        priceToman: 0,
      }),
    ).toThrow(/PAID/);
    expect(() =>
      assertCoherentPricing({
        offerKind: CourseOfferKind.PRE_SALE,
        priceToman: 1_900_000,
      }),
    ).not.toThrow();
  });
});
