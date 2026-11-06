import type {
  Course,
  Order,
  PaymentTransaction,
  Prisma,
} from "@zharfa/database";
import { decimalToNumber, formatTomanLabel } from "../catalog/pricing";

type OrderWithRelations = Order & {
  course: Pick<Course, "id" | "slug" | "title" | "coverAsset">;
  transactions?: PaymentTransaction[];
};

export function toPublicOrder(order: OrderWithRelations) {
  const amount = decimalToNumber(order.amountToman);
  const list = decimalToNumber(order.listPriceToman);
  const discount = decimalToNumber(order.discountToman);
  return {
    id: order.id,
    status: order.status,
    paymentProvider: order.paymentProvider,
    course: {
      id: order.course.id,
      slug: order.course.slug,
      title: order.course.title,
      coverAsset: order.course.coverAsset,
      href: `/courses/${order.course.slug}`,
    },
    listPriceToman: list,
    discountToman: discount,
    amountToman: amount,
    listPriceLabel: formatTomanLabel(order.listPriceToman),
    discountLabel: discount > 0 ? formatTomanLabel(order.discountToman) : null,
    amountLabel: formatTomanLabel(order.amountToman),
    couponCode: order.couponCode,
    paidAt: order.paidAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    latestTransaction: order.transactions?.[0]
      ? {
          id: order.transactions[0].id,
          status: order.transactions[0].status,
          provider: order.transactions[0].provider,
          gatewayRefId: order.transactions[0].gatewayRefId,
          failureReason: order.transactions[0].failureReason,
        }
      : null,
  };
}

export function amountInt(value: Prisma.Decimal | string | number): number {
  return decimalToNumber(value);
}
