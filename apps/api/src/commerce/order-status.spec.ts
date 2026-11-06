import { describe, expect, it } from "vitest";
import { OrderStatus, PaymentTransactionStatus } from "@zharfa/database";
import {
  assertOrderTransition,
  assertPaymentTransition,
  canTransitionOrder,
  canTransitionPayment,
  isOrderTerminal,
} from "./order-status";

describe("order status transitions", () => {
  it("allows PENDING → AWAITING_GATEWAY → PAID", () => {
    expect(
      canTransitionOrder(OrderStatus.PENDING, OrderStatus.AWAITING_GATEWAY),
    ).toBe(true);
    expect(
      canTransitionOrder(OrderStatus.AWAITING_GATEWAY, OrderStatus.PAID),
    ).toBe(true);
  });

  it("forbids jumping PENDING → PAID (no fake success)", () => {
    expect(canTransitionOrder(OrderStatus.PENDING, OrderStatus.PAID)).toBe(
      false,
    );
    expect(() =>
      assertOrderTransition(OrderStatus.PENDING, OrderStatus.PAID),
    ).toThrow(/Invalid order status/);
  });

  it("marks PAID/CANCELED/REFUNDED as terminal", () => {
    expect(isOrderTerminal(OrderStatus.PAID)).toBe(true);
    expect(isOrderTerminal(OrderStatus.CANCELED)).toBe(true);
    expect(isOrderTerminal(OrderStatus.REFUNDED)).toBe(true);
    expect(isOrderTerminal(OrderStatus.AWAITING_GATEWAY)).toBe(false);
  });
});

describe("payment transaction transitions", () => {
  it("requires CALLBACK_RECEIVED before VERIFIED", () => {
    expect(
      canTransitionPayment(
        PaymentTransactionStatus.REDIRECTED,
        PaymentTransactionStatus.VERIFIED,
      ),
    ).toBe(false);
    expect(
      canTransitionPayment(
        PaymentTransactionStatus.CALLBACK_RECEIVED,
        PaymentTransactionStatus.VERIFIED,
      ),
    ).toBe(true);
  });

  it("rejects invalid payment leaps", () => {
    expect(() =>
      assertPaymentTransition(
        PaymentTransactionStatus.CREATED,
        PaymentTransactionStatus.VERIFIED,
      ),
    ).toThrow(/Invalid payment status/);
  });
});
