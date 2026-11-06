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

type AqayeCreateResponse = {
  status?: string;
  transid?: string;
  code?: string | number;
};

type AqayeVerifyResponse = {
  status?: string;
  code?: string | number;
};

/**
 * AqayePardakht (آقای پرداخت) v2 API.
 * Docs: https://aqayepardakht.ir/api/
 *
 * Create:  POST https://panel.aqayepardakht.ir/api/v2/create
 * Verify:  POST https://panel.aqayepardakht.ir/api/v2/verify
 * StartPay: https://panel.aqayepardakht.ir/startpay/{transid}
 * Sandbox start: …/startpay/sandbox/{transid}
 *
 * Amount is Toman. Verify code "1" = success, "2" = already verified.
 * Never mark PAID from browser return alone — always call verify.
 */
@Injectable()
export class AqayePardakhtAdapter implements PaymentGatewayAdapter {
  readonly provider = PaymentProvider.AQAYE_PARDAKHT;
  private readonly logger = new Logger(AqayePardakhtAdapter.name);

  hasCredentials(): boolean {
    return Boolean(this.pin());
  }

  integrationStatus(): GatewayIntegrationStatus {
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
        reason: "درگاه آقای پرداخت از نظر فنی غیرفعال است.",
      };
    }
    if (status === "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED") {
      return {
        ok: false,
        integrationStatus: status,
        reason:
          "AQAYE_PARDAKHT_PIN تنظیم نشده — IMPLEMENTED_BUT_CREDENTIALS_REQUIRED",
      };
    }

    const body = {
      pin: this.pin(),
      amount: input.amountToman,
      callback: input.callbackUrl,
      callback_method: "GET",
      invoice_id: input.orderId,
      ...(input.mobile ? { mobile: input.mobile } : {}),
      ...(input.email ? { email: input.email } : {}),
      description: input.description,
    };

    try {
      const res = await fetch("https://panel.aqayepardakht.ir/api/v2/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as AqayeCreateResponse;
      if (json.status === "success" && json.transid) {
        const path = this.sandbox()
          ? `startpay/sandbox/${json.transid}`
          : `startpay/${json.transid}`;
        return {
          ok: true,
          authority: json.transid,
          redirectUrl: `https://panel.aqayepardakht.ir/${path}`,
          raw: json,
        };
      }
      return {
        ok: false,
        integrationStatus: "IMPLEMENTED",
        reason: `آقای پرداخت درخواست را رد کرد (code=${String(json.code ?? "unknown")}).`,
        raw: json,
      };
    } catch (err) {
      this.logger.error("AqayePardakht create failed", err as Error);
      return {
        ok: false,
        integrationStatus: "IMPLEMENTED",
        reason: "ارتباط با آقای پرداخت برقرار نشد.",
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
            ? "AQAYE_PARDAKHT_PIN تنظیم نشده — بدون وریفای واقعی پرداخت موفق نمی‌شود."
            : "درگاه آقای پرداخت غیرفعال است.",
      };
    }

    // status=0 from callback means unpaid — do not call verify.
    if (input.callbackStatus != null && String(input.callbackStatus) === "0") {
      return {
        ok: false,
        reason: "پرداخت ناموفق بود (status=0).",
        raw: { status: input.callbackStatus },
      };
    }

    try {
      const res = await fetch("https://panel.aqayepardakht.ir/api/v2/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          pin: this.pin(),
          amount: input.amountToman,
          transid: input.authority,
        }),
      });
      const json = (await res.json()) as AqayeVerifyResponse;
      const code = String(json.code ?? "");
      // "1" = paid; "2" = already verified (idempotent success).
      if (json.status === "success" && (code === "1" || code === "2")) {
        return {
          ok: true,
          alreadyVerified: code === "2",
          refId: input.authority,
          raw: json,
        };
      }
      return {
        ok: false,
        reason: `تأیید آقای پرداخت ناموفق بود (code=${code || "unknown"}).`,
        raw: json,
      };
    } catch (err) {
      this.logger.error("AqayePardakht verify failed", err as Error);
      return {
        ok: false,
        reason: "ارتباط با آقای پرداخت برای تأیید برقرار نشد.",
      };
    }
  }

  private pin(): string | null {
    const pin = process.env.AQAYE_PARDAKHT_PIN?.trim();
    return pin && pin.length > 0 ? pin : null;
  }

  private sandbox(): boolean {
    return (
      (process.env.AQAYE_PARDAKHT_SANDBOX ?? "true").toLowerCase() !== "false"
    );
  }

  private technicalEnabled(): boolean {
    return (
      (process.env.AQAYE_PARDAKHT_TECHNICAL_ENABLED ?? "true").toLowerCase() !==
      "false"
    );
  }
}
