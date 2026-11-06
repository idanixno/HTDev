import { PaymentProvider } from "@zharfa/database";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  GatewayIntegrationStatus,
  PaymentGatewayAdapter,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "./payment-gateway.types";

/**
 * Test-only sandbox hook. Enabled when PAYMENT_MOCK_HOOKS=true.
 * Still requires an explicit verifyPayment call with Authority ending in
 * `-OK` (or callbackStatus OK/1) — browser return alone never marks paid.
 *
 * NEVER used as a production success path.
 */
export class MockPaymentAdapter implements PaymentGatewayAdapter {
  constructor(readonly provider: PaymentProvider) {}

  hasCredentials(): boolean {
    return process.env.PAYMENT_MOCK_HOOKS === "true";
  }

  integrationStatus(): GatewayIntegrationStatus {
    if (!this.hasCredentials()) return "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED";
    return "IMPLEMENTED";
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (!this.hasCredentials()) {
      return {
        ok: false,
        integrationStatus: "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED",
        reason: "PAYMENT_MOCK_HOOKS=true لازم است برای هوک تست.",
      };
    }
    const authority = `MOCK-${this.provider}-${input.orderId}-${Date.now()}`;
    return {
      ok: true,
      authority,
      redirectUrl: `${input.callbackUrl}?Authority=${encodeURIComponent(authority)}&Status=OK&transid=${encodeURIComponent(authority)}&status=1&mock=1`,
      raw: { mock: true, authority },
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    if (!this.hasCredentials()) {
      return {
        ok: false,
        integrationStatus: "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED",
        reason: "Mock hooks disabled.",
      };
    }

    const st = (input.callbackStatus ?? "").toString().toUpperCase();
    if (st === "NOK" || st === "0") {
      return { ok: false, reason: "Mock: cancelled/failed callback.", raw: input };
    }

    // Explicit verify required — authority must be a mock authority we issued.
    if (!input.authority.startsWith("MOCK-")) {
      return { ok: false, reason: "Mock: invalid authority.", raw: input };
    }

    // Simulate already-verified idempotency when authority ends with :again
    if (input.authority.endsWith(":again")) {
      return {
        ok: true,
        alreadyVerified: true,
        refId: `MOCK-REF-${input.authority}`,
        raw: { mock: true, code: 101 },
      };
    }

    return {
      ok: true,
      alreadyVerified: false,
      refId: `MOCK-REF-${input.authority}`,
      cardPan: "6037****1234",
      raw: { mock: true, code: 100 },
    };
  }
}
