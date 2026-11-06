import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  CourseOfferKind,
  CoursePublicationStatus,
  GatewayCredentialsStatus,
  OrderStatus,
  SpotPlayerAccessSource,
  SpotPlayerLicenseStatus,
} from "@zharfa/database";
import { PrismaService } from "../prisma/prisma.service";
import {
  decryptSecret,
  encryptSecret,
  last4,
  maskSecret,
} from "./credential-crypto";
import {
  accessIdempotencyKey,
  canRetryProvisioning,
  shouldSkipProvisioning,
} from "./provisioning-logic";
import {
  closeAccessProvisioningQueue,
  enqueueAccessProvisioning,
} from "./provisioning-queue";
import {
  MockSpotPlayerAdapter,
  SpotPlayerHttpAdapter,
} from "./spotplayer.adapter";
import {
  studentAccessInstructions,
  toAdminLicense,
  toPublicLicense,
} from "./spotplayer.mapper";
import type {
  SpotPlayerAdapter,
  SpotPlayerIntegrationStatus,
} from "./spotplayer.types";
import { DEFAULT_LICENSE_ENDPOINT } from "./spotplayer.types";

@Injectable()
export class SpotPlayerService implements OnModuleDestroy {
  private readonly logger = new Logger(SpotPlayerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleDestroy() {
    await closeAccessProvisioningQueue();
  }

  // ── Credentials / settings ───────────────────────────────────────────

  private resolveApiKeySync(encrypted: string | null | undefined): string | null {
    const fromEnv = process.env.SPOTPLAYER_API_KEY?.trim();
    if (fromEnv) return fromEnv;
    if (encrypted) return decryptSecret(encrypted);
    return null;
  }

  private buildAdapter(encrypted: string | null | undefined): SpotPlayerAdapter {
    if (process.env.SPOTPLAYER_MOCK_HOOKS === "true") {
      return new MockSpotPlayerAdapter();
    }
    return new SpotPlayerHttpAdapter(() => this.resolveApiKeySync(encrypted));
  }

  async ensureSetting() {
    const existing = await this.prisma.spotPlayerSetting.findUnique({
      where: { id: "default" },
    });
    if (existing) {
      const key = this.resolveApiKeySync(existing.apiKeyEncrypted);
      const credentialsStatus = key
        ? GatewayCredentialsStatus.PRESENT
        : GatewayCredentialsStatus.MISSING;
      if (existing.credentialsStatus !== credentialsStatus) {
        return this.prisma.spotPlayerSetting.update({
          where: { id: "default" },
          data: { credentialsStatus },
        });
      }
      return existing;
    }
    const fromEnv = Boolean(process.env.SPOTPLAYER_API_KEY?.trim());
    return this.prisma.spotPlayerSetting.create({
      data: {
        id: "default",
        technicalEnabled: true,
        testMode: true,
        credentialsStatus: fromEnv
          ? GatewayCredentialsStatus.PRESENT
          : GatewayCredentialsStatus.MISSING,
        licenseEndpoint: DEFAULT_LICENSE_ENDPOINT,
      },
    });
  }

  async getPublicConfig() {
    const setting = await this.ensureSetting();
    const adapter = this.buildAdapter(setting.apiKeyEncrypted);
    const integrationStatus = adapter.integrationStatus(setting.technicalEnabled);
    const key = this.resolveApiKeySync(setting.apiKeyEncrypted);
    return {
      technicalEnabled: setting.technicalEnabled,
      testMode: setting.testMode,
      integrationStatus,
      credentialsStatus: key
        ? GatewayCredentialsStatus.PRESENT
        : GatewayCredentialsStatus.MISSING,
      apiKeyMasked: maskSecret(key),
      licenseEndpoint:
        process.env.SPOTPLAYER_LICENSE_ENDPOINT?.trim() ||
        setting.licenseEndpoint ||
        DEFAULT_LICENSE_ENDPOINT,
      source: process.env.SPOTPLAYER_API_KEY?.trim()
        ? ("env" as const)
        : setting.apiKeyEncrypted
          ? ("database" as const)
          : ("missing" as const),
      platformSupport: studentAccessInstructions(),
    };
  }

  async updateSettings(input: {
    technicalEnabled?: boolean;
    testMode?: boolean;
    apiKey?: string | null;
    clearApiKey?: boolean;
    licenseEndpoint?: string | null;
  }) {
    await this.ensureSetting();
    const data: {
      technicalEnabled?: boolean;
      testMode?: boolean;
      apiKeyEncrypted?: string | null;
      apiKeyLast4?: string | null;
      licenseEndpoint?: string | null;
      credentialsStatus?: GatewayCredentialsStatus;
    } = {};

    if (typeof input.technicalEnabled === "boolean") {
      data.technicalEnabled = input.technicalEnabled;
    }
    if (typeof input.testMode === "boolean") {
      data.testMode = input.testMode;
    }
    if (input.clearApiKey) {
      data.apiKeyEncrypted = null;
      data.apiKeyLast4 = null;
    } else if (typeof input.apiKey === "string" && input.apiKey.trim()) {
      const plain = input.apiKey.trim();
      data.apiKeyEncrypted = encryptSecret(plain);
      data.apiKeyLast4 = last4(plain);
    }
    if (input.licenseEndpoint !== undefined) {
      data.licenseEndpoint = input.licenseEndpoint?.trim() || null;
    }

    const keyAfter = (() => {
      if (process.env.SPOTPLAYER_API_KEY?.trim()) {
        return process.env.SPOTPLAYER_API_KEY.trim();
      }
      if (input.clearApiKey) return null;
      if (typeof input.apiKey === "string" && input.apiKey.trim()) {
        return input.apiKey.trim();
      }
      return null;
    })();

    // Recompute credentials after update when env not set.
    const updated = await this.prisma.spotPlayerSetting.update({
      where: { id: "default" },
      data: {
        ...data,
        credentialsStatus:
          process.env.SPOTPLAYER_API_KEY?.trim() || keyAfter || data.apiKeyEncrypted
            ? GatewayCredentialsStatus.PRESENT
            : GatewayCredentialsStatus.MISSING,
      },
    });

    // Fix credentials when we only toggled flags and key already in DB.
    const resolved = this.resolveApiKeySync(updated.apiKeyEncrypted);
    if (
      (resolved ? GatewayCredentialsStatus.PRESENT : GatewayCredentialsStatus.MISSING) !==
      updated.credentialsStatus
    ) {
      await this.prisma.spotPlayerSetting.update({
        where: { id: "default" },
        data: {
          credentialsStatus: resolved
            ? GatewayCredentialsStatus.PRESENT
            : GatewayCredentialsStatus.MISSING,
        },
      });
    }

    return this.getPublicConfig();
  }

  // ── Course mapping ───────────────────────────────────────────────────

  async listMappings() {
    const rows = await this.prisma.spotPlayerCourseMapping.findMany({
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            offerKind: true,
            publicationStatus: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return {
      items: rows.map((r) => ({
        id: r.id,
        courseId: r.courseId,
        spotPlayerCourseId: r.spotPlayerCourseId,
        enabled: r.enabled,
        course: r.course,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    };
  }

  async upsertMapping(input: {
    courseId: string;
    spotPlayerCourseId: string;
    enabled?: boolean;
  }) {
    const course = await this.prisma.course.findUnique({
      where: { id: input.courseId },
    });
    if (!course) throw new NotFoundException("دوره یافت نشد.");
    const spotId = input.spotPlayerCourseId.trim();
    if (!spotId) {
      throw new BadRequestException("شناسه دوره اسپات‌پلیر الزامی است.");
    }
    const row = await this.prisma.spotPlayerCourseMapping.upsert({
      where: { courseId: input.courseId },
      create: {
        courseId: input.courseId,
        spotPlayerCourseId: spotId,
        enabled: input.enabled ?? true,
      },
      update: {
        spotPlayerCourseId: spotId,
        ...(typeof input.enabled === "boolean" ? { enabled: input.enabled } : {}),
      },
      include: {
        course: {
          select: { id: true, slug: true, title: true, offerKind: true },
        },
      },
    });
    return {
      id: row.id,
      courseId: row.courseId,
      spotPlayerCourseId: row.spotPlayerCourseId,
      enabled: row.enabled,
      course: row.course,
    };
  }

  // ── Grant / queue ─────────────────────────────────────────────────────

  /**
   * After verified payment — creates PENDING license (idempotent) and enqueues job.
   * Does not invent keys. Payment status stays PAID regardless of provisioning.
   */
  async queueAfterPaidOrder(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order || order.status !== OrderStatus.PAID) {
      this.logger.warn(`queueAfterPaidOrder skipped — order not PAID (${orderId})`);
      return;
    }
    await this.createAndEnqueue({
      userId: order.userId,
      courseId: order.courseId,
      orderId: order.id,
      accessSource: SpotPlayerAccessSource.PAID_ORDER,
    });
  }

  /**
   * Free course path: enroll + queue SpotPlayer without payment gateway.
   */
  async grantFreeAccess(userId: string, courseSlug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug: courseSlug },
    });
    if (
      !course ||
      course.publicationStatus !== CoursePublicationStatus.PUBLISHED
    ) {
      throw new NotFoundException("دوره یافت نشد.");
    }
    if (course.offerKind !== CourseOfferKind.FREE) {
      throw new BadRequestException(
        "فقط دوره‌های رایگان از این مسیر دسترسی می‌گیرند.",
      );
    }

    await this.prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId: course.id } },
      create: { userId, courseId: course.id },
      update: {},
    });

    const license = await this.createAndEnqueue({
      userId,
      courseId: course.id,
      orderId: null,
      accessSource: SpotPlayerAccessSource.FREE_COURSE,
    });

    return {
      enrollment: true,
      license: toPublicLicense({
        ...license,
        course: {
          id: course.id,
          slug: course.slug,
          title: course.title,
          coverAsset: course.coverAsset,
          offerKind: course.offerKind,
        },
      }),
      instructions: studentAccessInstructions(),
      note:
        license.status === SpotPlayerLicenseStatus.SUCCEEDED
          ? "لایسنس قبلاً صادر شده است."
          : "درخواست دسترسی در صف صدور لایسنس قرار گرفت — تا پاسخ واقعی اسپات‌پلیر وضعیت SUCCEEDED نمی‌شود.",
    };
  }

  private async createAndEnqueue(input: {
    userId: string;
    courseId: string;
    orderId: string | null;
    accessSource: SpotPlayerAccessSource;
  }) {
    const idempotencyKey = accessIdempotencyKey(input.userId, input.courseId);

    let license = await this.prisma.spotPlayerLicense.findUnique({
      where: { userId_courseId: { userId: input.userId, courseId: input.courseId } },
    });

    if (!license) {
      license = await this.prisma.spotPlayerLicense.create({
        data: {
          userId: input.userId,
          courseId: input.courseId,
          orderId: input.orderId,
          accessSource: input.accessSource,
          status: SpotPlayerLicenseStatus.PENDING,
          idempotencyKey,
        },
      });
    } else if (
      input.orderId &&
      !license.orderId
    ) {
      license = await this.prisma.spotPlayerLicense.update({
        where: { id: license.id },
        data: { orderId: input.orderId },
      });
    }

    if (shouldSkipProvisioning(license.status, license.licenseKey)) {
      return license;
    }

    license = await this.prisma.spotPlayerLicense.update({
      where: { id: license.id },
      data: { status: SpotPlayerLicenseStatus.QUEUED },
    });

    try {
      await enqueueAccessProvisioning({
        licenseId: license.id,
        idempotencyKey: license.idempotencyKey,
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : "queue enqueue failed";
      this.logger.error(`Failed to enqueue provisioning: ${reason}`);
      await this.prisma.spotPlayerLicense.update({
        where: { id: license.id },
        data: {
          status: SpotPlayerLicenseStatus.FAILED,
          lastError: `Queue error: ${reason}`,
          lastAttemptAt: new Date(),
        },
      });
      // Re-read
      license = await this.prisma.spotPlayerLicense.findUniqueOrThrow({
        where: { id: license.id },
      });
    }

    return license;
  }

  /**
   * Worker entry: process one license. Idempotent if already SUCCEEDED with key.
   * Never sets SUCCEEDED without adapter ok + key from provider.
   */
  async processProvisioning(licenseId: string) {
    const license = await this.prisma.spotPlayerLicense.findUnique({
      where: { id: licenseId },
      include: {
        user: true,
        course: true,
      },
    });
    if (!license) {
      throw new Error(`License ${licenseId} not found`);
    }

    if (shouldSkipProvisioning(license.status, license.licenseKey)) {
      return {
        outcome: "already_succeeded" as const,
        licenseId: license.id,
      };
    }

    const setting = await this.ensureSetting();
    const adapter = this.buildAdapter(setting.apiKeyEncrypted);
    const integrationStatus = adapter.integrationStatus(setting.technicalEnabled);

    await this.prisma.spotPlayerLicense.update({
      where: { id: license.id },
      data: {
        status: SpotPlayerLicenseStatus.IN_PROGRESS,
        attemptCount: { increment: 1 },
        lastAttemptAt: new Date(),
      },
    });

    if (integrationStatus === "DISABLED") {
      return this.failLicense(
        license.id,
        "SpotPlayer technicalEnabled=false (DISABLED).",
        integrationStatus,
      );
    }
    if (integrationStatus === "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED") {
      return this.failLicense(
        license.id,
        "SpotPlayer credentials missing (IMPLEMENTED_BUT_CREDENTIALS_REQUIRED).",
        integrationStatus,
      );
    }

    const mapping = await this.prisma.spotPlayerCourseMapping.findUnique({
      where: { courseId: license.courseId },
    });
    if (!mapping || !mapping.enabled || !mapping.spotPlayerCourseId.trim()) {
      return this.failLicense(
        license.id,
        "Course has no enabled SpotPlayer course mapping.",
      );
    }

    const watermark =
      license.user.phone?.trim() ||
      license.user.email?.trim() ||
      license.user.username;

    // Prefer setting.licenseEndpoint via env override already in adapter.
    if (setting.licenseEndpoint?.trim()) {
      process.env.SPOTPLAYER_LICENSE_ENDPOINT =
        process.env.SPOTPLAYER_LICENSE_ENDPOINT?.trim() ||
        setting.licenseEndpoint.trim();
    }

    const result = await adapter.createLicense({
      courseIds: [mapping.spotPlayerCourseId.trim()],
      name: license.user.displayName || license.user.username,
      watermarkTexts: [watermark],
      test: setting.testMode,
      payload: license.orderId ?? license.idempotencyKey,
    });

    if (!result.ok) {
      return this.failLicense(
        license.id,
        result.reason,
        result.integrationStatus,
        result.raw,
      );
    }

    // Strict: require provider key — never invent.
    if (!result.licenseKey?.trim() || !result.licenseId?.trim()) {
      return this.failLicense(
        license.id,
        "Provider response lacked license key/_id — not inventing success.",
        undefined,
        result.raw,
      );
    }

    const updated = await this.prisma.spotPlayerLicense.update({
      where: { id: license.id },
      data: {
        status: SpotPlayerLicenseStatus.SUCCEEDED,
        spotPlayerLicenseId: result.licenseId,
        licenseKey: result.licenseKey,
        licenseUrl: result.licenseUrl || null,
        provisionedAt: new Date(),
        lastError: null,
        providerPayload: result.raw as object,
      },
    });

    return {
      outcome: "succeeded" as const,
      licenseId: updated.id,
      spotPlayerLicenseId: updated.spotPlayerLicenseId,
    };
  }

  private async failLicense(
    licenseId: string,
    reason: string,
    integrationStatus?: SpotPlayerIntegrationStatus,
    raw?: unknown,
  ) {
    await this.prisma.spotPlayerLicense.update({
      where: { id: licenseId },
      data: {
        status: SpotPlayerLicenseStatus.FAILED,
        lastError: integrationStatus
          ? `${reason} [${integrationStatus}]`
          : reason,
        lastAttemptAt: new Date(),
        ...(raw !== undefined
          ? { providerPayload: raw as object }
          : {}),
      },
    });
    return {
      outcome: "failed" as const,
      licenseId,
      reason,
      integrationStatus,
    };
  }

  async retryLicense(licenseId: string) {
    const license = await this.prisma.spotPlayerLicense.findUnique({
      where: { id: licenseId },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverAsset: true,
            offerKind: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
          },
        },
      },
    });
    if (!license) throw new NotFoundException("لایسنس یافت نشد.");
    if (shouldSkipProvisioning(license.status, license.licenseKey)) {
      return {
        license: toAdminLicense(license),
        note: "قبلاً با موفقیت صادر شده — صدور مجدد انجام نشد.",
      };
    }
    if (
      !canRetryProvisioning(license.status) &&
      license.status !== SpotPlayerLicenseStatus.IN_PROGRESS
    ) {
      throw new ConflictException("وضعیت فعلی قابل تلاش مجدد نیست.");
    }

    const updated = await this.prisma.spotPlayerLicense.update({
      where: { id: license.id },
      data: { status: SpotPlayerLicenseStatus.QUEUED, lastError: null },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverAsset: true,
            offerKind: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    // Use a retry-suffixed job id so BullMQ accepts a new job after prior completion.
    const retryJobId = `${license.idempotencyKey}:retry:${updated.attemptCount + 1}`;
    try {
      const { enqueueWithJobId } = await import("./provisioning-queue-retry");
      await enqueueWithJobId(retryJobId, {
        licenseId: license.id,
        idempotencyKey: license.idempotencyKey,
      });
    } catch {
      await enqueueAccessProvisioning({
        licenseId: license.id,
        idempotencyKey: license.idempotencyKey,
      });
    }

    return {
      license: toAdminLicense(updated),
      note: "در صف تلاش مجدد قرار گرفت.",
    };
  }

  // ── Student / admin reads ────────────────────────────────────────────

  async listMyAccess(userId: string) {
    const rows = await this.prisma.spotPlayerLicense.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverAsset: true,
            offerKind: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    const config = await this.getPublicConfig();
    return {
      items: rows.map(toPublicLicense),
      instructions: studentAccessInstructions(),
      integrationStatus: config.integrationStatus,
    };
  }

  async adminListLicenses(query?: { status?: SpotPlayerLicenseStatus }) {
    const rows = await this.prisma.spotPlayerLicense.findMany({
      where: query?.status ? { status: query.status } : undefined,
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverAsset: true,
            offerKind: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });
    return {
      items: rows.map(toAdminLicense),
      config: await this.getPublicConfig(),
    };
  }

  async adminDiagnostics() {
    const setting = await this.getPublicConfig();
    const [pending, queued, inProgress, succeeded, failed, mappings] =
      await Promise.all([
        this.prisma.spotPlayerLicense.count({
          where: { status: SpotPlayerLicenseStatus.PENDING },
        }),
        this.prisma.spotPlayerLicense.count({
          where: { status: SpotPlayerLicenseStatus.QUEUED },
        }),
        this.prisma.spotPlayerLicense.count({
          where: { status: SpotPlayerLicenseStatus.IN_PROGRESS },
        }),
        this.prisma.spotPlayerLicense.count({
          where: { status: SpotPlayerLicenseStatus.SUCCEEDED },
        }),
        this.prisma.spotPlayerLicense.count({
          where: { status: SpotPlayerLicenseStatus.FAILED },
        }),
        this.prisma.spotPlayerCourseMapping.count({ where: { enabled: true } }),
      ]);

    return {
      config: setting,
      counts: { pending, queued, inProgress, succeeded, failed, mappings },
      notes: [
        "OrderStatus.PAID و SpotPlayerLicenseStatus محورهای جدا هستند.",
        "SUCCEEDED فقط پس از پاسخ واقعی اسپات‌پلیر (_id + key) ثبت می‌شود.",
        "کلید API در پاسخ‌ها فقط به‌صورت masked دیده می‌شود.",
      ],
    };
  }

  /** Sync process path for unit tests (no Redis required). */
  async processProvisioningForTests(licenseId: string) {
    return this.processProvisioning(licenseId);
  }

  requireUsableOrThrow(status: SpotPlayerIntegrationStatus) {
    if (status === "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED") {
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: "اعتبارنامه اسپات‌پلیر تنظیم نشده است.",
        integrationStatus: status,
        code: status,
      });
    }
    if (status === "DISABLED") {
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: "یکپارچه‌سازی اسپات‌پلیر غیرفعال است.",
        integrationStatus: status,
        code: status,
      });
    }
  }
}
