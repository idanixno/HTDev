import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationEventType,
  Prisma,
  type User,
} from "@zharfa/database";
import { PrismaService } from "../prisma/prisma.service";
import {
  EMAIL_CHANNEL,
  SMS_CHANNEL,
  type EmailChannelAdapter,
  type SmsChannelAdapter,
} from "./channels/console-channel.adapters";
import { checkNotifyRateLimit } from "./rate-limit";
import {
  renderTemplate,
  type TemplateContext,
} from "./templates";

export type EmitNotificationInput = {
  userId: string;
  eventType: NotificationEventType;
  context?: TemplateContext;
  payload?: Record<string, unknown>;
  /** Override channels; default IN_APP + EMAIL (+ SMS if phone present). */
  channels?: NotificationChannel[];
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMAIL_CHANNEL) private readonly email: EmailChannelAdapter,
    @Inject(SMS_CHANNEL) private readonly sms: SmsChannelAdapter,
  ) {}

  /**
   * Create an in-app notification and fan out to email/SMS adapters.
   * Adapters are console/dev when real credentials are absent — never fakes success of payments.
   */
  async emit(input: EmitNotificationInput) {
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
    });
    if (!user) {
      this.logger.warn(`emit skipped: user ${input.userId} not found`);
      return null;
    }

    const ctx: TemplateContext = {
      displayName: user.displayName,
      ...(input.context ?? {}),
    };
    const rendered = renderTemplate(input.eventType, ctx);

    const notification = await this.prisma.notification.create({
      data: {
        userId: user.id,
        eventType: input.eventType,
        title: rendered.title,
        body: rendered.body,
        payload: (input.payload ?? {}) as Prisma.InputJsonValue,
      },
    });

    const channels =
      input.channels ??
      this.defaultChannels(user, input.eventType);

    const deliveries = [];
    for (const channel of channels) {
      deliveries.push(
        await this.deliver({
          notificationId: notification.id,
          user,
          channel,
          templateKey: rendered.templateKey,
          emailSubject: rendered.emailSubject,
          emailBody: rendered.emailBody,
          smsBody: rendered.smsBody,
        }),
      );
    }

    return { notification, deliveries };
  }

  async listForUser(
    userId: string,
    opts?: { unreadOnly?: boolean; take?: number },
  ) {
    const take = Math.min(Math.max(opts?.take ?? 30, 1), 100);
    const items = await this.prisma.notification.findMany({
      where: {
        userId,
        ...(opts?.unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        deliveries: {
          select: {
            id: true,
            channel: true,
            status: true,
            templateKey: true,
            sentAt: true,
            error: true,
          },
        },
      },
    });
    const unreadCount = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return {
      items: items.map((n) => ({
        id: n.id,
        eventType: n.eventType,
        title: n.title,
        body: n.body,
        payload: n.payload,
        readAt: n.readAt,
        createdAt: n.createdAt,
        deliveries: n.deliveries,
      })),
      unreadCount,
    };
  }

  async markRead(userId: string, notificationId: string) {
    const n = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!n) throw new NotFoundException("اعلان یافت نشد.");
    if (n.readAt) return { id: n.id, readAt: n.readAt };
    const updated = await this.prisma.notification.update({
      where: { id: n.id },
      data: { readAt: new Date() },
    });
    return { id: updated.id, readAt: updated.readAt };
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: result.count };
  }

  private defaultChannels(
    user: User,
    eventType: NotificationEventType,
  ): NotificationChannel[] {
    const channels: NotificationChannel[] = [NotificationChannel.IN_APP];
    if (user.email) channels.push(NotificationChannel.EMAIL);
    // SMS for security + ticket reply only (cost/noise control)
    if (
      user.phone &&
      (eventType === NotificationEventType.SECURITY_RECOVERY_REQUESTED ||
        eventType === NotificationEventType.SECURITY_PASSWORD_CHANGED ||
        eventType === NotificationEventType.TICKET_REPLY)
    ) {
      channels.push(NotificationChannel.SMS);
    }
    return channels;
  }

  private async deliver(input: {
    notificationId: string;
    user: User;
    channel: NotificationChannel;
    templateKey: string;
    emailSubject: string;
    emailBody: string;
    smsBody: string;
  }) {
    const destination =
      input.channel === NotificationChannel.EMAIL
        ? input.user.email
        : input.channel === NotificationChannel.SMS
          ? input.user.phone
          : null;

    if (
      (input.channel === NotificationChannel.EMAIL ||
        input.channel === NotificationChannel.SMS) &&
      !destination
    ) {
      return this.prisma.notificationDelivery.create({
        data: {
          notificationId: input.notificationId,
          channel: input.channel,
          status: NotificationDeliveryStatus.SKIPPED,
          templateKey: input.templateKey,
          destination: null,
          error: "no_destination",
          attemptCount: 0,
        },
      });
    }

    if (
      input.channel === NotificationChannel.EMAIL ||
      input.channel === NotificationChannel.SMS
    ) {
      const rate = checkNotifyRateLimit(
        `${input.user.id}:${input.channel}`,
      );
      if (!rate.allowed) {
        return this.prisma.notificationDelivery.create({
          data: {
            notificationId: input.notificationId,
            channel: input.channel,
            status: NotificationDeliveryStatus.SKIPPED,
            templateKey: input.templateKey,
            destination,
            error: `rate_limited:${rate.retryAfterMs}ms`,
            attemptCount: 0,
          },
        });
      }
    }

    const row = await this.prisma.notificationDelivery.create({
      data: {
        notificationId: input.notificationId,
        channel: input.channel,
        status: NotificationDeliveryStatus.PENDING,
        templateKey: input.templateKey,
        destination,
        attemptCount: 1,
      },
    });

    try {
      if (input.channel === NotificationChannel.IN_APP) {
        // Persisted Notification row is the in-app delivery.
      } else if (input.channel === NotificationChannel.EMAIL && destination) {
        await this.email.send({
          to: destination,
          subject: input.emailSubject,
          body: input.emailBody,
        });
      } else if (input.channel === NotificationChannel.SMS && destination) {
        await this.sms.send({ to: destination, body: input.smsBody });
      }

      return this.prisma.notificationDelivery.update({
        where: { id: row.id },
        data: {
          status: NotificationDeliveryStatus.SENT,
          sentAt: new Date(),
          error: null,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "delivery_failed";
      this.logger.warn(`delivery failed ${input.channel}: ${message}`);
      return this.prisma.notificationDelivery.update({
        where: { id: row.id },
        data: {
          status: NotificationDeliveryStatus.FAILED,
          error: message.slice(0, 500),
        },
      });
    }
  }
}
