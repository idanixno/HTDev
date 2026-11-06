import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { PaymentProvider } from "@zharfa/database";
import { MockPaymentAdapter } from "./mock.adapter";

describe("MockPaymentAdapter", () => {
  const prev = process.env.PAYMENT_MOCK_HOOKS;

  beforeEach(() => {
    process.env.PAYMENT_MOCK_HOOKS = "true";
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.PAYMENT_MOCK_HOOKS;
    else process.env.PAYMENT_MOCK_HOOKS = prev;
  });

  it("creates a mock authority but verify requires explicit call", async () => {
    const adapter = new MockPaymentAdapter(PaymentProvider.ZARINPAL);
    const created = await adapter.createPayment({
      amountToman: 10000,
      description: "test",
      callbackUrl: "http://localhost:4000/commerce/callbacks/zarinpal",
      orderId: "ord_1",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const cancelled = await adapter.verifyPayment({
      amountToman: 10000,
      authority: created.authority,
      callbackStatus: "NOK",
    });
    expect(cancelled.ok).toBe(false);

    const verified = await adapter.verifyPayment({
      amountToman: 10000,
      authority: created.authority,
      callbackStatus: "OK",
    });
    expect(verified.ok).toBe(true);
    if (!verified.ok) return;
    expect(verified.alreadyVerified).toBe(false);
    expect(verified.refId).toContain("MOCK-REF");
  });

  it("rejects non-mock authorities (invalid verification)", async () => {
    const adapter = new MockPaymentAdapter(PaymentProvider.AQAYE_PARDAKHT);
    const result = await adapter.verifyPayment({
      amountToman: 10000,
      authority: "REAL-LOOKING-AUTHORITY",
      callbackStatus: "OK",
    });
    expect(result.ok).toBe(false);
  });

  it("reports credentials required when mock hooks off", async () => {
    delete process.env.PAYMENT_MOCK_HOOKS;
    const adapter = new MockPaymentAdapter(PaymentProvider.ZARINPAL);
    expect(adapter.integrationStatus()).toBe(
      "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED",
    );
    const created = await adapter.createPayment({
      amountToman: 1,
      description: "x",
      callbackUrl: "http://x",
      orderId: "o",
    });
    expect(created.ok).toBe(false);
    if (created.ok) return;
    expect(created.integrationStatus).toBe(
      "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED",
    );
  });
});
