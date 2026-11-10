import { Injectable, Logger } from "@nestjs/common";
import { PaymentProvider } from "@zharfa/database";
import {
  aqayeCreateTransaction,
  aqayeStartPayUrl,
  aqayeVerifyTransaction,
  publicWebOrigin,
  resolveAqayePin,
  validateAqayeAmount,
} from "./aqayepardakht.client";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  GatewayIntegrationStatus,
  PaymentGatewayAdapter,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "./payment-gateway.types";

/**
 * AqayePardakht (آقای پرداخت) adapter — ready for sandbox and production.
 *
 * Sandbox (default): pin `sandbox`, startpay `/startpay/sandbox/{transid}`.
 * No merchant PIN required while sandbox is on.
 *
 * Production: set `AQAYE_PARDAKHT_PIN` and turn sandbox off (env + admin flag).
 * Browser return alone never marks PAID — verify API is always required.
 *
 * Docs: https://aqayepardakht.ir/api/
 */
@Injectable()
export class AqayePardakhtAdapter implements PaymentGatewayAdapter {
  readonly provider = PaymentProvider.AQAYE_PARDAKHT;
  private readonly logger = new Logger(AqayePardakhtAdapter.name);

  hasCredentials(sandbox?: boolean): boolean {
    return Boolean(
      resolveAqayePin(this.configuredPin(), sandbox ?? this.envSandbox()),
    );
  }

  integrationStatus(sandbox?: boolean): GatewayIntegrationStatus {
    if (!this.technicalEnabled()) return "DISABLED";
    if (!this.hasCredentials(sandbox)) {
      return "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED";
    }
    return "IMPLEMENTED";
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const sandbox = input.sandbox ?? this.envSandbox();
    const pin = resolveAqayePin(this.configuredPin(), sandbox);

    if (!this.technicalEnabled()) {
      return {
        ok: false,
        integrationStatus: "DISABLED",
        reason: "درگاه آقای پرداخت از نظر فنی غیرفعال است.",
      };
    }
    if (!pin) {
      return {
        ok: false,
        integrationStatus: "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED",
        reason:
          "AQAYE_PARDAKHT_PIN تنظیم نشده — برای محیط واقعی پین درگاه لازم است. برای تست، سندباکس را روشن بگذارید (پین sandbox).",
      };
    }

    const amountError = validateAqayeAmount(input.amountToman);
    if (amountError) {
      return {
        ok: false,
        integrationStatus: "IMPLEMENTED",
        reason: amountError,
      };
    }

    try {
      const result = await aqayeCreateTransaction({
        pin,
        amount: input.amountToman,
        callback: input.callbackUrl,
        callbackMethod: "GET",
        invoiceId: input.orderId,
        mobile: input.mobile,
        email: input.email,
        description: input.description,
        referer: publicWebOrigin(),
      });

      if (result.ok) {
        const useSandboxPay = sandbox || pin === "sandbox";
        return {
          ok: true,
          authority: result.transid,
          redirectUrl: aqayeStartPayUrl(result.transid, useSandboxPay),
          raw: result.raw,
        };
      }

      this.logger.warn(
        `AqayePardakht create rejected code=${result.code}: ${result.message}`,
      );
      return {
        ok: false,
        integrationStatus: "IMPLEMENTED",
        reason: result.message,
        raw: result.raw,
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
    const sandbox = input.sandbox ?? this.envSandbox();
    const pin = resolveAqayePin(this.configuredPin(), sandbox);

    if (!this.technicalEnabled()) {
      return {
        ok: false,
        integrationStatus: "DISABLED",
        reason: "درگاه آقای پرداخت غیرفعال است.",
      };
    }
    if (!pin) {
      return {
        ok: false,
        integrationStatus: "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED",
        reason:
          "AQAYE_PARDAKHT_PIN تنظیم نشده — بدون وریفای واقعی پرداخت موفق نمی‌شود.",
      };
    }

    // Docs: skip verify when callback status is 0 (failed/cancelled).
    if (input.callbackStatus != null && String(input.callbackStatus) === "0") {
      return {
        ok: false,
        reason: "پرداخت ناموفق بود (status=0).",
        raw: { status: input.callbackStatus },
      };
    }

    try {
      const result = await aqayeVerifyTransaction({
        pin,
        amount: input.amountToman,
        transid: input.authority,
        referer: publicWebOrigin(),
      });

      if (result.ok) {
        return {
          ok: true,
          alreadyVerified: result.alreadyVerified,
          refId: (input.trackingNumber?.trim() || input.authority).trim(),
          cardPan: input.cardNumber?.trim() || null,
          raw: {
            ...(typeof result.raw === "object" && result.raw
              ? (result.raw as object)
              : { verify: result.raw }),
            tracking_number: input.trackingNumber ?? null,
            cardnumber: input.cardNumber ?? null,
            bank: input.bank ?? null,
          },
        };
      }

      return {
        ok: false,
        reason: result.message,
        raw: result.raw,
      };
    } catch (err) {
      this.logger.error("AqayePardakht verify failed", err as Error);
      return {
        ok: false,
        reason: "ارتباط با آقای پرداخت برای تأیید برقرار نشد.",
      };
    }
  }

  private configuredPin(): string | null {
    const pin = process.env.AQAYE_PARDAKHT_PIN?.trim();
    return pin && pin.length > 0 ? pin : null;
  }

  private envSandbox(): boolean {
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
