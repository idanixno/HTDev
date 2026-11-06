import { describe, expect, it } from "vitest";
import { PaymentProvider } from "@zharfa/database";
import { MockPaymentAdapter } from "./gateways/mock.adapter";

/**
 * Simulates duplicate-callback / already-verified handling at the adapter layer.
 * Full DB idempotency lives in CommerceService.markPaidIdempotent (integration).
 */
describe("duplicate callback / invalid verification", () => {
  it("treats already-verified mock authority as success without inventing a new ref path", async () => {
    process.env.PAYMENT_MOCK_HOOKS = "true";
    const adapter = new MockPaymentAdapter(PaymentProvider.ZARINPAL);
    const first = await adapter.verifyPayment({
      amountToman: 50000,
      authority: "MOCK-ZARINPAL-ord:again",
      callbackStatus: "OK",
    });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.alreadyVerified).toBe(true);

    const second = await adapter.verifyPayment({
      amountToman: 50000,
      authority: "MOCK-ZARINPAL-ord:again",
      callbackStatus: "OK",
    });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.alreadyVerified).toBe(true);
    expect(second.refId).toBe(first.refId);
  });

  it("never succeeds on browser OK alone with a forged authority", async () => {
    process.env.PAYMENT_MOCK_HOOKS = "true";
    const adapter = new MockPaymentAdapter(PaymentProvider.AQAYE_PARDAKHT);
    const forged = await adapter.verifyPayment({
      amountToman: 50000,
      authority: "forged-ok-from-browser",
      callbackStatus: "OK",
    });
    expect(forged.ok).toBe(false);
  });
});
