import { CouponDiscountType, Prisma } from "@zharfa/database";
import { toDecimal } from "../catalog/pricing";

export type CouponMathInput = {
  discountType: CouponDiscountType;
  percentOff?: Prisma.Decimal | string | number | null;
  amountOffToman?: Prisma.Decimal | string | number | null;
  minOrderToman?: Prisma.Decimal | string | number | null;
  maxDiscountToman?: Prisma.Decimal | string | number | null;
  active: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
  maxRedemptions?: number | null;
  redemptionCount: number;
};

export type CouponMathResult =
  | {
      ok: true;
      listPriceToman: Prisma.Decimal;
      discountToman: Prisma.Decimal;
      amountToman: Prisma.Decimal;
    }
  | { ok: false; reason: string };

function roundToman(value: Prisma.Decimal): Prisma.Decimal {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

/**
 * Pure coupon pricing. Never grants access — only computes payable Toman.
 */
export function applyCoupon(
  listPriceToman: Prisma.Decimal | string | number,
  coupon: CouponMathInput,
  now: Date = new Date(),
): CouponMathResult {
  const list = roundToman(toDecimal(listPriceToman));
  if (list.isNegative()) {
    return { ok: false, reason: "قیمت نامعتبر است." };
  }

  if (!coupon.active) {
    return { ok: false, reason: "این کد تخفیف غیرفعال است." };
  }
  if (coupon.startsAt && now < coupon.startsAt) {
    return { ok: false, reason: "این کد تخفیف هنوز فعال نشده است." };
  }
  if (coupon.endsAt && now > coupon.endsAt) {
    return { ok: false, reason: "این کد تخفیف منقضی شده است." };
  }
  if (
    coupon.maxRedemptions != null &&
    coupon.redemptionCount >= coupon.maxRedemptions
  ) {
    return { ok: false, reason: "سقف استفاده از این کد پر شده است." };
  }

  if (coupon.minOrderToman != null) {
    const min = toDecimal(coupon.minOrderToman);
    if (list.lessThan(min)) {
      return {
        ok: false,
        reason: "مبلغ سفارش برای این کد تخفیف کافی نیست.",
      };
    }
  }

  let discount = new Prisma.Decimal(0);

  if (coupon.discountType === CouponDiscountType.PERCENT) {
    if (coupon.percentOff == null) {
      return { ok: false, reason: "درصد تخفیف پیکربندی نشده است." };
    }
    const percent = toDecimal(coupon.percentOff);
    if (percent.lessThanOrEqualTo(0) || percent.greaterThan(100)) {
      return { ok: false, reason: "درصد تخفیف نامعتبر است." };
    }
    discount = list.mul(percent).div(100);
  } else if (coupon.discountType === CouponDiscountType.FIXED_TOMAN) {
    if (coupon.amountOffToman == null) {
      return { ok: false, reason: "مبلغ تخفیف پیکربندی نشده است." };
    }
    discount = toDecimal(coupon.amountOffToman);
    if (discount.lessThanOrEqualTo(0)) {
      return { ok: false, reason: "مبلغ تخفیف نامعتبر است." };
    }
  } else {
    const _exhaustive: never = coupon.discountType;
    return _exhaustive;
  }

  if (coupon.maxDiscountToman != null) {
    const max = toDecimal(coupon.maxDiscountToman);
    if (discount.greaterThan(max)) discount = max;
  }

  if (discount.greaterThan(list)) discount = list;
  discount = roundToman(discount);
  const amount = roundToman(list.sub(discount));

  if (amount.isNegative()) {
    return { ok: false, reason: "محاسبه تخفیف نامعتبر است." };
  }

  return {
    ok: true,
    listPriceToman: list,
    discountToman: discount,
    amountToman: amount,
  };
}

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}
