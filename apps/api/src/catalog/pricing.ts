import { CourseOfferKind, Prisma } from "@zharfa/database";

export type DecimalLike = Prisma.Decimal | string | number;

export function toDecimal(value: DecimalLike): Prisma.Decimal {
  if (value instanceof Prisma.Decimal) return value;
  return new Prisma.Decimal(value);
}

export function decimalToNumber(value: DecimalLike): number {
  return toDecimal(value).toNumber();
}

/**
 * Format Toman for Persian UI as colloquial «هزارتومن» (÷1000).
 * Stored amounts stay in full toman; display drops three zeros.
 */
export function formatTomanLabel(value: DecimalLike): string {
  const amount = toDecimal(value);
  if (amount.isZero()) return "۰ هزارتومن";

  const asNumber = amount.toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP).toNumber();
  const display = Math.round(asNumber / 1000);
  return `${display.toLocaleString("fa-IR")} هزارتومن`;
}

export function priceLabelForOffer(input: {
  offerKind: CourseOfferKind;
  priceToman: DecimalLike;
}): string {
  if (input.offerKind === CourseOfferKind.FREE) return "رایگان";
  if (input.offerKind === CourseOfferKind.COMING_SOON) {
    const amount = toDecimal(input.priceToman);
    if (amount.isZero()) return "به‌زودی";
    return formatTomanLabel(amount);
  }
  return formatTomanLabel(input.priceToman);
}

/**
 * Normalize gateway/order integer toman from Decimal list price.
 * Rounds half-up to nearest toman; never invents payment success.
 */
export function tomanIntegerForOrder(priceToman: DecimalLike): number {
  const amount = toDecimal(priceToman);
  if (amount.isNegative()) {
    throw new Error("priceToman must be non-negative");
  }
  return amount.toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP).toNumber();
}

export function assertCoherentPricing(input: {
  offerKind: CourseOfferKind;
  priceToman: DecimalLike;
}): void {
  const amount = toDecimal(input.priceToman);
  if (amount.isNegative()) {
    throw new Error("priceToman must be non-negative");
  }
  if (input.offerKind === CourseOfferKind.FREE && !amount.isZero()) {
    throw new Error("FREE offer requires zero priceToman");
  }
  if (
    (input.offerKind === CourseOfferKind.PAID ||
      input.offerKind === CourseOfferKind.PRE_SALE) &&
    amount.isZero()
  ) {
    throw new Error(`${input.offerKind} offer requires positive priceToman`);
  }
}
