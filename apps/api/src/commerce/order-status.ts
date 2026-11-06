import { OrderStatus, PaymentTransactionStatus } from "@zharfa/database";

const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.AWAITING_GATEWAY, OrderStatus.CANCELED],
  [OrderStatus.AWAITING_GATEWAY]: [
    OrderStatus.PAID,
    OrderStatus.FAILED,
    OrderStatus.CANCELED,
  ],
  [OrderStatus.FAILED]: [OrderStatus.AWAITING_GATEWAY, OrderStatus.CANCELED],
  [OrderStatus.PAID]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELED]: [],
  [OrderStatus.REFUNDED]: [],
};

const PAYMENT_TRANSITIONS: Record<
  PaymentTransactionStatus,
  readonly PaymentTransactionStatus[]
> = {
  [PaymentTransactionStatus.CREATED]: [
    PaymentTransactionStatus.REDIRECTED,
    PaymentTransactionStatus.FAILED,
    PaymentTransactionStatus.CANCELED,
  ],
  [PaymentTransactionStatus.REDIRECTED]: [
    PaymentTransactionStatus.CALLBACK_RECEIVED,
    PaymentTransactionStatus.FAILED,
    PaymentTransactionStatus.CANCELED,
  ],
  [PaymentTransactionStatus.CALLBACK_RECEIVED]: [
    PaymentTransactionStatus.VERIFIED,
    PaymentTransactionStatus.FAILED,
  ],
  [PaymentTransactionStatus.VERIFIED]: [],
  [PaymentTransactionStatus.FAILED]: [],
  [PaymentTransactionStatus.CANCELED]: [],
};

export function canTransitionOrder(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  if (from === to) return true;
  return ORDER_TRANSITIONS[from].includes(to);
}

export function assertOrderTransition(
  from: OrderStatus,
  to: OrderStatus,
): void {
  if (!canTransitionOrder(from, to)) {
    throw new Error(`Invalid order status transition: ${from} → ${to}`);
  }
}

export function canTransitionPayment(
  from: PaymentTransactionStatus,
  to: PaymentTransactionStatus,
): boolean {
  if (from === to) return true;
  return PAYMENT_TRANSITIONS[from].includes(to);
}

export function assertPaymentTransition(
  from: PaymentTransactionStatus,
  to: PaymentTransactionStatus,
): void {
  if (!canTransitionPayment(from, to)) {
    throw new Error(`Invalid payment status transition: ${from} → ${to}`);
  }
}

/** Terminal order states that must not start a new gateway redirect. */
export function isOrderTerminal(status: OrderStatus): boolean {
  return (
    status === OrderStatus.PAID ||
    status === OrderStatus.CANCELED ||
    status === OrderStatus.REFUNDED
  );
}
