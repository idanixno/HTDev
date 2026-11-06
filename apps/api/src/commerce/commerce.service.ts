import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
  forwardRef,
} from "@nestjs/common";
import {
  CourseOfferKind,
  CoursePublicationStatus,
  NotificationEventType,
  OrderStatus,
  PaymentProvider,
  PaymentTransactionStatus,
  Prisma,
} from "@zharfa/database";
import { isPurchasableOffer } from "../catalog/course-state";
import { decimalToNumber, toDecimal } from "../catalog/pricing";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { SpotPlayerService } from "../spotplayer/spotplayer.service";
import { applyCoupon, normalizeCouponCode } from "./coupon-math";
import { amountInt, toPublicOrder } from "./commerce.mapper";
import { GatewayRegistryService } from "./gateways/gateway-registry.service";
import {
  assertOrderTransition,
  assertPaymentTransition,
  isOrderTerminal,
} from "./order-status";

@Injectable()
export class CommerceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateways: GatewayRegistryService,
    @Optional()
    @Inject(forwardRef(() => SpotPlayerService))
    private readonly spotplayer?: SpotPlayerService,
    @Optional()
    @Inject(forwardRef(() => NotificationsService))
    private readonly notifications?: NotificationsService,
  ) {}

  async getCheckoutOptions(courseSlug: string) {
    const course = await this.requirePurchasableCourse(courseSlug);
    const gateways = await this.gateways.listGatewayViews();
    const purchaseEnabled = gateways.some((g) => g.usableAtCheckout);
    return {
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        offerKind: course.offerKind,
        priceToman: decimalToNumber(course.priceToman),
        priceLabel: `${decimalToNumber(course.priceToman).toLocaleString("fa-IR")} تومان`,
      },
      gateways,
      purchaseEnabled,
      integrationNote: purchaseEnabled
        ? null
        : "هیچ درگاه قابل‌استفاده‌ای فعال نیست — خرید پولی غیرفعال است (IMPLEMENTED_BUT_CREDENTIALS_REQUIRED یا DISABLED).",
    };
  }

  async validateCoupon(courseSlug: string, couponCode: string) {
    const course = await this.requirePurchasableCourse(courseSlug);
    const coupon = await this.findActiveCoupon(couponCode);
    if (!coupon) {
      throw new BadRequestException("کد تخفیف یافت نشد.");
    }
    const result = applyCoupon(course.priceToman, coupon);
    if (!result.ok) {
      throw new BadRequestException(result.reason);
    }
    return {
      couponCode: coupon.code,
      listPriceToman: decimalToNumber(result.listPriceToman),
      discountToman: decimalToNumber(result.discountToman),
      amountToman: decimalToNumber(result.amountToman),
      amountLabel: `${decimalToNumber(result.amountToman).toLocaleString("fa-IR")} تومان`,
    };
  }

  async startCheckout(
    userId: string,
    input: {
      courseSlug: string;
      couponCode?: string;
      provider?: PaymentProvider;
      email?: string | null;
      phone?: string | null;
    },
  ) {
    const course = await this.requirePurchasableCourse(input.courseSlug);

    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: course.id },
      },
    });
    if (existingEnrollment) {
      throw new ConflictException("قبلاً به این دوره دسترسی دارید.");
    }

    const paidOrder = await this.prisma.order.findFirst({
      where: {
        userId,
        courseId: course.id,
        status: OrderStatus.PAID,
      },
    });
    if (paidOrder) {
      throw new ConflictException("سفارش پرداخت‌شده برای این دوره وجود دارد.");
    }

    let listPrice = toDecimal(course.priceToman);
    let discount = new Prisma.Decimal(0);
    let amount = listPrice;
    let couponId: string | null = null;
    let couponCodeSnap: string | null = null;

    if (input.couponCode?.trim()) {
      const coupon = await this.findActiveCoupon(input.couponCode);
      if (!coupon) {
        throw new BadRequestException("کد تخفیف یافت نشد.");
      }
      const priced = applyCoupon(course.priceToman, coupon);
      if (!priced.ok) {
        throw new BadRequestException(priced.reason);
      }
      listPrice = priced.listPriceToman;
      discount = priced.discountToman;
      amount = priced.amountToman;
      couponId = coupon.id;
      couponCodeSnap = coupon.code;
    }

    // Free after coupon still needs an explicit path later; for now require payable > 0.
    if (amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException(
        "مبلغ قابل پرداخت صفر است — مسیر رایگان جداگانه است و پرداخت جعلی نداریم.",
      );
    }

    const gateway = await this.gateways.resolveCheckoutProvider(input.provider);
    if (!gateway) {
      throw new ServiceUnavailableException({
        statusCode: 503,
        message:
          "هیچ درگاه پرداخت قابل‌استفاده‌ای پیکربندی نشده است.",
        integrationStatus: "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED",
        code: "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED",
      });
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        courseId: course.id,
        couponId,
        couponCode: couponCodeSnap,
        listPriceToman: listPrice,
        discountToman: discount,
        amountToman: amount,
        currency: "IRT",
        status: OrderStatus.PENDING,
        paymentProvider: gateway.provider,
      },
    });

    const callbackUrl = this.callbackUrl(gateway.provider, order.id);
    const adapter = this.gateways.getAdapter(gateway.provider);
    const amountTomanInt = amountInt(amount);

    const created = await adapter.createPayment({
      amountToman: amountTomanInt,
      description: `خرید دوره ${course.title}`,
      callbackUrl,
      orderId: order.id,
      mobile: input.phone,
      email: input.email,
    });

    if (!created.ok) {
      assertOrderTransition(order.status, OrderStatus.FAILED);
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.FAILED },
      });
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: created.reason,
        integrationStatus: created.integrationStatus,
        code: created.integrationStatus,
      });
    }

    const idempotencyKey = `${gateway.provider}:${created.authority}`;
    const tx = await this.prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        provider: gateway.provider,
        status: PaymentTransactionStatus.REDIRECTED,
        amountToman: amount,
        gatewayAuthority: created.authority,
        idempotencyKey,
      },
    });

    assertOrderTransition(OrderStatus.PENDING, OrderStatus.AWAITING_GATEWAY);
    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.AWAITING_GATEWAY },
    });

    return {
      orderId: order.id,
      transactionId: tx.id,
      provider: gateway.provider,
      amountToman: amountTomanInt,
      redirectUrl: created.redirectUrl,
      status: OrderStatus.AWAITING_GATEWAY,
    };
  }

  /**
   * Gateway browser return + server-side verify.
   * Idempotent: duplicate callbacks for an already VERIFIED tx return the same success.
   * NEVER trusts browser Status alone without adapter.verifyPayment.
   */
  async handleCallback(
    provider: PaymentProvider,
    query: Record<string, string | undefined>,
  ) {
    const authority =
      query.Authority ?? query.authority ?? query.transid ?? query.TransId;
    if (!authority) {
      throw new BadRequestException("شناسه درگاه (Authority/transid) موجود نیست.");
    }

    const callbackStatus = query.Status ?? query.status ?? null;
    const orderIdHint = query.orderId ?? null;

    const tx = await this.prisma.paymentTransaction.findFirst({
      where: {
        provider,
        gatewayAuthority: authority,
        ...(orderIdHint ? { orderId: orderIdHint } : {}),
      },
      include: {
        order: { include: { course: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!tx) {
      throw new NotFoundException("تراکنش متناظر یافت نشد.");
    }

    // Idempotent success path
    if (
      tx.status === PaymentTransactionStatus.VERIFIED &&
      tx.order.status === OrderStatus.PAID
    ) {
      return {
        outcome: "already_paid" as const,
        orderId: tx.orderId,
        redirectPath: `/payments/success?orderId=${tx.orderId}`,
      };
    }

    assertPaymentTransition(tx.status, PaymentTransactionStatus.CALLBACK_RECEIVED);
    await this.prisma.paymentTransaction.update({
      where: { id: tx.id },
      data: {
        status: PaymentTransactionStatus.CALLBACK_RECEIVED,
        callbackPayload: query as Prisma.InputJsonValue,
      },
    });

    const adapter = this.gateways.getAdapter(provider);
    const verify = await adapter.verifyPayment({
      amountToman: amountInt(tx.amountToman),
      authority,
      callbackStatus,
    });

    if (!verify.ok) {
      assertPaymentTransition(
        PaymentTransactionStatus.CALLBACK_RECEIVED,
        PaymentTransactionStatus.FAILED,
      );
      assertOrderTransition(tx.order.status, OrderStatus.FAILED);
      await this.prisma.$transaction([
        this.prisma.paymentTransaction.update({
          where: { id: tx.id },
          data: {
            status: PaymentTransactionStatus.FAILED,
            failureReason: verify.reason,
            verifyPayload: (verify.raw ?? { reason: verify.reason }) as Prisma.InputJsonValue,
          },
        }),
        this.prisma.order.update({
          where: { id: tx.orderId },
          data: { status: OrderStatus.FAILED },
        }),
      ]);
      try {
        await this.notifications?.emit({
          userId: tx.order.userId,
          eventType: NotificationEventType.ORDER_FAILED,
          context: {
            courseTitle: tx.order.course?.title,
            orderId: tx.orderId,
            detail: verify.reason,
          },
          payload: { orderId: tx.orderId, reason: verify.reason },
        });
      } catch {
        /* non-blocking */
      }

      return {
        outcome: "failed" as const,
        orderId: tx.orderId,
        reason: verify.reason,
        redirectPath: `/payments/failure?orderId=${tx.orderId}`,
      };
    }

    await this.markPaidIdempotent({
      transactionId: tx.id,
      orderId: tx.orderId,
      userId: tx.order.userId,
      courseId: tx.order.courseId,
      couponId: tx.order.couponId,
      refId: verify.refId,
      verifyPayload: verify.raw,
    });

    try {
      await this.notifications?.emit({
        userId: tx.order.userId,
        eventType: NotificationEventType.ORDER_PAID,
        context: {
          courseTitle: tx.order.course?.title,
          orderId: tx.orderId,
        },
        payload: { orderId: tx.orderId, courseId: tx.order.courseId },
      });
    } catch {
      /* non-blocking */
    }

    // Access provisioning is separate from payment — queue after PAID only.
    // Failures here must not roll back OrderStatus.PAID.
    try {
      await this.spotplayer?.queueAfterPaidOrder(tx.orderId);
    } catch {
      // Worker/admin retry path covers queue outages.
    }

    return {
      outcome: "paid" as const,
      orderId: tx.orderId,
      alreadyVerified: verify.alreadyVerified,
      redirectPath: `/payments/success?orderId=${tx.orderId}`,
    };
  }

  async getOrderForUser(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        course: {
          select: { id: true, slug: true, title: true, coverAsset: true },
        },
        transactions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    if (!order) throw new NotFoundException("سفارش یافت نشد.");
    return toPublicOrder(order);
  }

  async listOrdersForUser(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        course: {
          select: { id: true, slug: true, title: true, coverAsset: true },
        },
        transactions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
    return { items: orders.map(toPublicOrder) };
  }

  async listGatewaySettings() {
    return { gateways: await this.gateways.listGatewayViews() };
  }

  async updateGatewaySetting(input: {
    provider: PaymentProvider;
    technicalEnabled?: boolean;
    checkoutVisible?: boolean;
    isDefault?: boolean;
    sandboxMode?: boolean;
  }) {
    const gateways = await this.gateways.updateSetting(input.provider, input);
    return { gateways };
  }

  /**
   * Test helper: process a second callback for the same authority (idempotency).
   * Used by unit/integration tests — not a public "fake success" path.
   */
  async processDuplicateCallbackForTests(
    provider: PaymentProvider,
    authority: string,
  ) {
    return this.handleCallback(provider, {
      Authority: authority,
      Status: "OK",
      status: "1",
      transid: authority,
    });
  }

  private async markPaidIdempotent(input: {
    transactionId: string;
    orderId: string;
    userId: string;
    courseId: string;
    couponId: string | null;
    refId: string;
    verifyPayload: unknown;
  }) {
    await this.prisma.$transaction(async (db) => {
      const fresh = await db.paymentTransaction.findUniqueOrThrow({
        where: { id: input.transactionId },
        include: { order: true },
      });

      if (
        fresh.status === PaymentTransactionStatus.VERIFIED &&
        fresh.order.status === OrderStatus.PAID
      ) {
        return;
      }

      assertPaymentTransition(fresh.status, PaymentTransactionStatus.VERIFIED);
      if (!isOrderTerminal(fresh.order.status)) {
        assertOrderTransition(fresh.order.status, OrderStatus.PAID);
      } else if (fresh.order.status !== OrderStatus.PAID) {
        throw new ConflictException(
          `Cannot mark order paid from ${fresh.order.status}`,
        );
      }

      await db.paymentTransaction.update({
        where: { id: input.transactionId },
        data: {
          status: PaymentTransactionStatus.VERIFIED,
          gatewayRefId: input.refId || fresh.gatewayRefId,
          verifyPayload: input.verifyPayload as Prisma.InputJsonValue,
          verifiedAt: fresh.verifiedAt ?? new Date(),
          failureReason: null,
        },
      });

      if (fresh.order.status !== OrderStatus.PAID) {
        await db.order.update({
          where: { id: input.orderId },
          data: {
            status: OrderStatus.PAID,
            paidAt: new Date(),
          },
        });

        await db.enrollment.upsert({
          where: {
            userId_courseId: {
              userId: input.userId,
              courseId: input.courseId,
            },
          },
          create: {
            userId: input.userId,
            courseId: input.courseId,
          },
          update: {},
        });

        if (input.couponId) {
          const existing = await db.couponRedemption.findUnique({
            where: { orderId: input.orderId },
          });
          if (!existing) {
            await db.couponRedemption.create({
              data: {
                couponId: input.couponId,
                orderId: input.orderId,
                userId: input.userId,
              },
            });
            await db.coupon.update({
              where: { id: input.couponId },
              data: { redemptionCount: { increment: 1 } },
            });
          }
        }
      }
    });
  }

  private callbackUrl(provider: PaymentProvider, orderId: string): string {
    const web =
      process.env.WEB_ORIGIN?.split(",")[0]?.trim() ?? "http://localhost:3000";
    const api =
      process.env.API_PUBLIC_URL?.trim() ||
      `http://localhost:${process.env.API_PORT ?? 4000}`;
    // Gateway hits API callback; API then redirects to honest web result pages.
    const path =
      provider === PaymentProvider.ZARINPAL
        ? `/commerce/callbacks/zarinpal`
        : `/commerce/callbacks/aqayepardakht`;
    const url = new URL(path, api);
    url.searchParams.set("orderId", orderId);
    // Keep web origin available for redirect composition
    url.searchParams.set("web", web);
    return url.toString();
  }

  private async requirePurchasableCourse(slug: string) {
    const course = await this.prisma.course.findUnique({ where: { slug } });
    if (
      !course ||
      course.publicationStatus !== CoursePublicationStatus.PUBLISHED
    ) {
      throw new NotFoundException("دوره یافت نشد.");
    }
    if (!isPurchasableOffer(course.offerKind)) {
      throw new BadRequestException(
        course.offerKind === CourseOfferKind.FREE
          ? "این دوره رایگان است و از مسیر خرید پولی عبور نمی‌کند."
          : "این دوره در حال حاضر قابل خرید نیست.",
      );
    }
    return course;
  }

  private async findActiveCoupon(code: string) {
    const normalized = normalizeCouponCode(code);
    if (!normalized) return null;
    return this.prisma.coupon.findUnique({
      where: { codeNormalized: normalized },
    });
  }
}
