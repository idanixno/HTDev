import { PaymentProvider } from "@zharfa/database";

/** Integration readiness for UI/admin — never implies payment success. */
export type GatewayIntegrationStatus =
  | "IMPLEMENTED"
  | "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED"
  | "DISABLED";

export type CreatePaymentInput = {
  amountToman: number;
  description: string;
  callbackUrl: string;
  orderId: string;
  mobile?: string | null;
  email?: string | null;
};

export type CreatePaymentResult =
  | {
      ok: true;
      authority: string;
      redirectUrl: string;
      raw: unknown;
    }
  | {
      ok: false;
      integrationStatus: GatewayIntegrationStatus;
      reason: string;
      raw?: unknown;
    };

export type VerifyPaymentInput = {
  amountToman: number;
  authority: string;
  /** ZarinPal callback Status=OK|NOK; AqayePardakht status=1|0 */
  callbackStatus?: string | null;
};

export type VerifyPaymentResult =
  | {
      ok: true;
      alreadyVerified: boolean;
      refId: string;
      cardPan?: string | null;
      raw: unknown;
    }
  | {
      ok: false;
      reason: string;
      integrationStatus?: GatewayIntegrationStatus;
      raw?: unknown;
    };

export interface PaymentGatewayAdapter {
  readonly provider: PaymentProvider;
  /** True when env credentials required for live/sandbox API calls are present. */
  hasCredentials(): boolean;
  integrationStatus(): GatewayIntegrationStatus;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
}

export const PAYMENT_GATEWAYS = Symbol("PAYMENT_GATEWAYS");
