import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { PaymentProvider } from "@zharfa/database";
import { AuthGuard, type AuthedRequest } from "../identity/auth.guard";
import { CommerceService } from "./commerce.service";
import { StartCheckoutDto, ValidateCouponDto } from "./dto/checkout.dto";
import { UpdateGatewaySettingDto } from "./dto/gateway-settings.dto";
import { OwnerGuard } from "./roles.guard";

@Controller("commerce")
export class CommerceController {
  constructor(private readonly commerce: CommerceService) {}

  @Get("checkout/:courseSlug")
  async checkoutOptions(@Param("courseSlug") courseSlug: string) {
    return this.commerce.getCheckoutOptions(courseSlug);
  }

  @Post("coupons/validate")
  @UseGuards(AuthGuard)
  async validateCoupon(@Body() body: ValidateCouponDto) {
    return this.commerce.validateCoupon(body.courseSlug, body.couponCode);
  }

  @Post("checkout/start")
  @UseGuards(AuthGuard)
  async startCheckout(
    @Req() req: AuthedRequest,
    @Body() body: StartCheckoutDto,
  ) {
    return this.commerce.startCheckout(req.user!.id, {
      courseSlug: body.courseSlug,
      couponCode: body.couponCode,
      provider: body.provider,
      email: req.user!.email,
      phone: req.user!.phone,
    });
  }

  @Get("orders")
  @UseGuards(AuthGuard)
  async myOrders(@Req() req: AuthedRequest) {
    return this.commerce.listOrdersForUser(req.user!.id);
  }

  @Get("orders/:id")
  @UseGuards(AuthGuard)
  async myOrder(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.commerce.getOrderForUser(req.user!.id, id);
  }

  @Get("admin/gateways")
  @UseGuards(OwnerGuard)
  async listGateways() {
    return this.commerce.listGatewaySettings();
  }

  @Patch("admin/gateways")
  @UseGuards(OwnerGuard)
  async updateGateway(@Body() body: UpdateGatewaySettingDto) {
    return this.commerce.updateGatewaySetting(body);
  }

  /** ZarinPal browser return — verifies server-side, then redirects to web UI. */
  @Get("callbacks/zarinpal")
  async zarinpalCallback(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    return this.finishCallback(PaymentProvider.ZARINPAL, query, res);
  }

  /** AqayePardakht browser return (callback_method=GET). */
  @Get("callbacks/aqayepardakht")
  async aqayeGetCallback(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    return this.finishCallback(PaymentProvider.AQAYE_PARDAKHT, query, res);
  }

  /** AqayePardakht default POST callback. */
  @Post("callbacks/aqayepardakht")
  async aqayePostCallback(
    @Body() body: Record<string, string>,
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    return this.finishCallback(
      PaymentProvider.AQAYE_PARDAKHT,
      { ...query, ...body },
      res,
    );
  }

  private async finishCallback(
    provider: PaymentProvider,
    query: Record<string, string>,
    res: Response,
  ) {
    const web = this.resolveWebOrigin(query.web);

    try {
      const result = await this.commerce.handleCallback(provider, query);
      const pending =
        result.outcome === "paid" || result.outcome === "already_paid"
          ? "success"
          : "failure";
      // Honest interim page first (pending) then result — web pages re-fetch order status.
      if (pending === "success") {
        return res.redirect(
          302,
          `${web}/payments/success?orderId=${encodeURIComponent(result.orderId)}`,
        );
      }
      return res.redirect(
        302,
        `${web}/payments/failure?orderId=${encodeURIComponent(result.orderId)}`,
      );
    } catch {
      return res.redirect(302, `${web}/payments/failure`);
    }
  }

  /** Only configured WEB_ORIGIN / SITE_URL — blocks open redirects via ?web=. */
  private resolveWebOrigin(raw: string | undefined): string {
    const allow = [
      process.env.WEB_ORIGIN ?? "",
      process.env.NEXT_PUBLIC_SITE_URL ?? "",
    ]
      .flatMap((s) => s.split(","))
      .map((s) => s.trim().replace(/\/$/, ""))
      .filter(Boolean);
    if (process.env.NODE_ENV !== "production") {
      allow.push("http://localhost:3000", "http://127.0.0.1:3000");
    }
    const unique = Array.from(new Set(allow));
    const fallback = unique[0] ?? "http://localhost:3000";
    if (!raw?.trim()) return fallback;
    try {
      const origin = new URL(raw.trim()).origin;
      if (unique.includes(origin)) return origin;
    } catch {
      /* ignore */
    }
    return fallback;
  }
}
