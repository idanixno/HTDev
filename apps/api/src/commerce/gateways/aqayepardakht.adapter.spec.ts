import { afterEach, describe, expect, it, vi } from "vitest";
import { AqayePardakhtAdapter } from "./aqayepardakht.adapter";

describe("AqayePardakhtAdapter", () => {
  const prevPin = process.env.AQAYE_PARDAKHT_PIN;
  const prevSandbox = process.env.AQAYE_PARDAKHT_SANDBOX;

  afterEach(() => {
    process.env.AQAYE_PARDAKHT_PIN = prevPin;
    process.env.AQAYE_PARDAKHT_SANDBOX = prevSandbox;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("is ready in sandbox without a merchant pin", () => {
    delete process.env.AQAYE_PARDAKHT_PIN;
    process.env.AQAYE_PARDAKHT_SANDBOX = "true";
    const adapter = new AqayePardakhtAdapter();
    expect(adapter.hasCredentials(true)).toBe(true);
    expect(adapter.integrationStatus(true)).toBe("IMPLEMENTED");
  });

  it("requires pin when sandbox is off", () => {
    delete process.env.AQAYE_PARDAKHT_PIN;
    process.env.AQAYE_PARDAKHT_SANDBOX = "false";
    const adapter = new AqayePardakhtAdapter();
    expect(adapter.hasCredentials(false)).toBe(false);
    expect(adapter.integrationStatus(false)).toBe(
      "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED",
    );
  });

  it("creates payment and redirects to sandbox startpay", async () => {
    delete process.env.AQAYE_PARDAKHT_PIN;
    process.env.AQAYE_PARDAKHT_SANDBOX = "true";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({ status: "success", transid: "TX-99" }),
      }),
    );

    const adapter = new AqayePardakhtAdapter();
    const result = await adapter.createPayment({
      amountToman: 15_000,
      description: "خرید دوره تست",
      callbackUrl: "http://localhost:4000/commerce/callbacks/aqayepardakht",
      orderId: "ord_1",
      sandbox: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.authority).toBe("TX-99");
      expect(result.redirectUrl).toBe(
        "https://panel.aqayepardakht.ir/startpay/sandbox/TX-99",
      );
    }
  });

  it("skips verify when callback status is 0", async () => {
    process.env.AQAYE_PARDAKHT_PIN = "sandbox";
    const adapter = new AqayePardakhtAdapter();
    const result = await adapter.verifyPayment({
      amountToman: 15_000,
      authority: "TX-1",
      callbackStatus: "0",
      sandbox: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/status=0/);
  });

  it("verifies and keeps tracking/card from callback", async () => {
    process.env.AQAYE_PARDAKHT_PIN = "sandbox";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ status: "success", code: "1" }),
      }),
    );
    const adapter = new AqayePardakhtAdapter();
    const result = await adapter.verifyPayment({
      amountToman: 15_000,
      authority: "TX-77",
      callbackStatus: "1",
      sandbox: true,
      trackingNumber: "998877",
      cardNumber: "6037-****-1234",
      bank: "melli",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.refId).toBe("998877");
      expect(result.cardPan).toBe("6037-****-1234");
      expect(result.alreadyVerified).toBe(false);
    }
  });
});
