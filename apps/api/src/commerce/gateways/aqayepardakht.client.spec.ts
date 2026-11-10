import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AQAYE_SANDBOX_PIN,
  aqayeCreateTransaction,
  aqayeErrorMessage,
  aqayeStartPayUrl,
  aqayeVerifyTransaction,
  resolveAqayePin,
  validateAqayeAmount,
} from "./aqayepardakht.client";

describe("aqayepardakht.client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("validates toman amount range", () => {
    expect(validateAqayeAmount(999)).toMatch(/۱٬۰۰۰/);
    expect(validateAqayeAmount(1000)).toBeNull();
    expect(validateAqayeAmount(400_000_000)).toBeNull();
    expect(validateAqayeAmount(400_000_001)).toMatch(/۴۰۰/);
    expect(validateAqayeAmount(10.5)).toMatch(/عددی/);
  });

  it("resolves sandbox pin when unset", () => {
    expect(resolveAqayePin(null, true)).toBe(AQAYE_SANDBOX_PIN);
    expect(resolveAqayePin("", true)).toBe(AQAYE_SANDBOX_PIN);
    expect(resolveAqayePin(null, false)).toBeNull();
    expect(resolveAqayePin(" real-pin ", false)).toBe("real-pin");
  });

  it("builds startpay urls for live and sandbox", () => {
    expect(aqayeStartPayUrl("abc", false)).toBe(
      "https://panel.aqayepardakht.ir/startpay/abc",
    );
    expect(aqayeStartPayUrl("abc", true)).toBe(
      "https://panel.aqayepardakht.ir/startpay/sandbox/abc",
    );
  });

  it("maps known error codes", () => {
    expect(aqayeErrorMessage("-15")).toMatch(/callback/);
    expect(aqayeErrorMessage("2")).toMatch(/قبلاً/);
  });

  it("creates a sandbox transaction via API contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({ status: "success", transid: "T-SANDBOX-1" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await aqayeCreateTransaction({
      pin: AQAYE_SANDBOX_PIN,
      amount: 20_000,
      callback: "http://localhost:4000/commerce/callbacks/aqayepardakht",
      callbackMethod: "GET",
      invoiceId: "order-1",
      description: "test",
      referer: "http://localhost:3000",
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.transid).toBe("T-SANDBOX-1");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.method).toBe("POST");
    expect(init.headers.Referer).toBe("http://localhost:3000/");
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.pin).toBe("sandbox");
    expect(body.callback_method).toBe("GET");
    expect(body.amount).toBe(20_000);
  });

  it("verifies success and already-verified codes", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ status: "success", code: "1" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ status: "success", code: "2" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const first = await aqayeVerifyTransaction({
      pin: AQAYE_SANDBOX_PIN,
      amount: 20_000,
      transid: "T-1",
    });
    expect(first.ok).toBe(true);
    if (first.ok) {
      expect(first.code).toBe("1");
      expect(first.alreadyVerified).toBe(false);
    }

    const second = await aqayeVerifyTransaction({
      pin: AQAYE_SANDBOX_PIN,
      amount: 20_000,
      transid: "T-1",
    });
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.alreadyVerified).toBe(true);
  });

  it("surfaces create API error codes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        text: async () => JSON.stringify({ status: "error", code: "-6" }),
      }),
    );
    const result = await aqayeCreateTransaction({
      pin: "bad",
      amount: 5000,
      callback: "http://localhost:4000/commerce/callbacks/aqayepardakht",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("-6");
      expect(result.message).toMatch(/پین/);
    }
  });
});
