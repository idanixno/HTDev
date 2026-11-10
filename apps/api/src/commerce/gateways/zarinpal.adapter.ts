import { Injectable, Logger } from "@nestjs/common";
import { PaymentProvider } from "@zharfa/database";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  GatewayIntegrationStatus,
  PaymentGatewayAdapter,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "./payment-gateway.types";

type ZarinPalRequestResponse = {
  data?: {
    code?: number;
    message?: string;
    authority?: string;
  };
  errors?: unknown;
};

type ZarinPalVerifyResponse = {
  data?: {
    code?: number;
    message?: string;
    ref_id?: number | string;
    card_pan?: string;
  };
  errors?: unknown;
};

/**
 * ZarinPal v4 JSON API.
 * Docs: https://www.zarinpal.com/docs/paymentGateway/connectToGateway
 *
 * Request: POST {base}/pg/v4/payment/request.json
 * Verify:  POST {base}/pg/v4/payment/verify.json
 * StartPay: {startBase}/pg/StartPay/{authority}
 *
 * Amounts use currency IRT (Toman) to match Zharfa Decimal Toman prices.
 * Sandbox: https://sandbox.zarinpal.com — merchant_id may be any 36-char string.
 */
@Injectable()
export class ZarinPalAdapter implements PaymentGatewayAdapter {
  readonly provider = PaymentProvider.ZARINPAL;
  private readonly logger = new Logger(ZarinPalAdapter.name);

  hasCredentials(_sandbox?: boolean): boolean {
    return Boolean(this.merchantId());
  }

  integrationStatus(_sandbox?: boolean): GatewayIntegrationStatus {
    if (!this.technicalEnabled()) return "DISABLED";
    if (!this.hasCredentials()) return "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED";
    return "IMPLEMENTED";
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const status = this.integrationStatus();
    if (status === "DISABLED") {
      return {
        ok: false,
        integrationStatus: status,
        reason: "درگاه زرین‌پال از نظر فنی غیرفعال است.",
      };
    }
    if (status === "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED") {
      return {
        ok: false,
        integrationStatus: status,
        reason:
          "ZARINPAL_MERCHANT_ID تنظیم نشده — IMPLEMENTED_BUT_CREDENTIALS_REQUIRED",
      };
    }

    const merchantId = this.merchantId()!;
    const body = {
      merchant_id: merchantId,
      amount: input.amountToman,
      currency: "IRT",
      description: input.description,
      callback_url: input.callbackUrl,
      metadata: {
        order_id: input.orderId,
        ...(input.mobile ? { mobile: input.mobile } : {}),
        ...(input.email ? { email: input.email } : {}),
      },
    };

    const url = `${this.apiBase()}/pg/v4/payment/request.json`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as ZarinPalRequestResponse;
      const code = json.data?.code;
      const authority = json.data?.authority;
      if (code === 100 && authority) {
        return {
          ok: true,
          authority,
          redirectUrl: `${this.startBase()}/pg/StartPay/${authority}`,
          raw: json,
        };
      }
      return {
        ok: false,
        integrationStatus: "IMPLEMENTED",
        reason: `زرین‌پال درخواست را رد کرد (code=${String(code ?? "unknown")}).`,
        raw: json,
      };
    } catch (err) {
      this.logger.error("ZarinPal request failed", err as Error);
      return {
        ok: false,
        integrationStatus: "IMPLEMENTED",
        reason: "ارتباط با زرین‌پال برقرار نشد.",
      };
    }
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const status = this.integrationStatus();
    if (status !== "IMPLEMENTED") {
      return {
        ok: false,
        integrationStatus: status,
        reason:
          status === "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED"
            ? "ZARINPAL_MERCHANT_ID تنظیم نشده — بدون وریفای واقعی پرداخت موفق نمی‌شود."
            : "درگاه زرین‌پال غیرفعال است.",
      };
    }

    // Browser return alone is never enough — Status=NOK skips verify.
    if (input.callbackStatus && input.callbackStatus.toUpperCase() !== "OK") {
      return {
        ok: false,
        reason: "پرداخت توسط کاربر لغو شد یا ناموفق بود (Status≠OK).",
        raw: { Status: input.callbackStatus },
      };
    }

    const url = `${this.apiBase()}/pg/v4/payment/verify.json`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          merchant_id: this.merchantId(),
          amount: input.amountToman,
          authority: input.authority,
        }),
      });
      const json = (await res.json()) as ZarinPalVerifyResponse;
      const code = json.data?.code;
      // 100 = first successful verify; 101 = already verified (idempotent success).
      if (code === 100 || code === 101) {
        return {
          ok: true,
          alreadyVerified: code === 101,
          refId: String(json.data?.ref_id ?? ""),
          cardPan: json.data?.card_pan ?? null,
          raw: json,
        };
      }
      return {
        ok: false,
        reason: `تأیید زرین‌پال ناموفق بود (code=${String(code ?? "unknown")}).`,
        raw: json,
      };
    } catch (err) {
      this.logger.error("ZarinPal verify failed", err as Error);
      return {
        ok: false,
        reason: "ارتباط با زرین‌پال برای تأیید برقرار نشد.",
      };
    }
  }

  private merchantId(): string | null {
    const id = process.env.ZARINPAL_MERCHANT_ID?.trim();
    return id && id.length > 0 ? id : null;
  }

  private sandbox(): boolean {
    return (process.env.ZARINPAL_SANDBOX ?? "true").toLowerCase() !== "false";
  }

  private apiBase(): string {
    return this.sandbox()
      ? "https://sandbox.zarinpal.com"
      : "https://payment.zarinpal.com";
  }

  private startBase(): string {
    return this.apiBase();
  }

  private technicalEnabled(): boolean {
    // Env override; DB setting also checked by GatewayRegistry.
    return (process.env.ZARINPAL_TECHNICAL_ENABLED ?? "true").toLowerCase() !==
      "false";
  }
}
