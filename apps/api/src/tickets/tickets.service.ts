import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
  forwardRef,
} from "@nestjs/common";
import {
  NotificationEventType,
  TicketAuthorRole,
  TicketStatus,
  UserRole,
  type User,
} from "@zharfa/database";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { ticketStatusLabelFa } from "../notifications/templates";
import {
  assertAllowedAttachment,
  assertAttachmentMagicBytes,
  buildAttachmentStorageKey,
  decodeBase64Payload,
  sha256Hex,
} from "./attachment-rules";
import { assertAttachmentContentSafe } from "./attachment-scan";
import { TicketAttachmentStorage } from "./attachment-storage";
import { ClamAvScanner } from "./clamav.scanner";
import type {
  CreateTicketDto,
  ReplyTicketDto,
  TicketAttachmentInputDto,
} from "./dto/ticket.dto";
import { assertTicketTransition } from "./ticket-status";
import { toPublicTicket } from "./tickets.mapper";

const ticketInclude = {
  course: { select: { id: true, slug: true, title: true } },
  user: {
    select: { id: true, username: true, displayName: true, email: true },
  },
  attachments: true,
  messages: {
    orderBy: { createdAt: "asc" as const },
    include: {
      author: {
        select: { id: true, displayName: true, username: true },
      },
      attachments: true,
    },
  },
};

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: TicketAttachmentStorage,
    private readonly clamav: ClamAvScanner,
    @Optional()
    @Inject(forwardRef(() => NotificationsService))
    private readonly notifications?: NotificationsService,
  ) {}

  async create(user: User, dto: CreateTicketDto) {
    let courseId: string | null = null;
    if (dto.courseSlug?.trim()) {
      const course = await this.prisma.course.findUnique({
        where: { slug: dto.courseSlug.trim() },
        select: { id: true, title: true, slug: true },
      });
      if (!course) {
        throw new BadRequestException("دوره مرتبط یافت نشد.");
      }
      courseId = course.id;
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        userId: user.id,
        courseId,
        subject: dto.subject.trim(),
        description: dto.description.trim(),
        telegramRef: dto.telegramRef?.trim() || null,
        status: TicketStatus.OPEN,
        messages: {
          create: {
            authorId: user.id,
            authorRole: TicketAuthorRole.STUDENT,
            body: dto.description.trim(),
          },
        },
      },
      include: ticketInclude,
    });

    const firstMessage = ticket.messages[0];
    if (dto.attachments?.length && firstMessage) {
      await this.persistAttachments({
        ticketId: ticket.id,
        messageId: firstMessage.id,
        uploadedById: user.id,
        items: dto.attachments,
      });
    }

    const full = await this.prisma.ticket.findUniqueOrThrow({
      where: { id: ticket.id },
      include: ticketInclude,
    });

    await this.notifications?.emit({
      userId: user.id,
      eventType: NotificationEventType.TICKET_CREATED,
      context: { subject: full.subject, ticketId: full.id },
      payload: { ticketId: full.id },
    });

    // Notify owner(s) in-app about new ticket
    const owners = await this.prisma.user.findMany({
      where: { role: UserRole.OWNER },
      select: { id: true },
    });
    for (const owner of owners) {
      await this.notifications?.emit({
        userId: owner.id,
        eventType: NotificationEventType.TICKET_CREATED,
        context: {
          subject: full.subject,
          ticketId: full.id,
          displayName: user.displayName,
        },
        payload: { ticketId: full.id, studentId: user.id },
        channels: undefined,
      });
    }

    return toPublicTicket(full, { includeThread: true });
  }

  async listMine(userId: string, status?: TicketStatus) {
    const items = await this.prisma.ticket.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      include: {
        course: { select: { id: true, slug: true, title: true } },
        attachments: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    return { items: items.map((t) => toPublicTicket(t)) };
  }

  async getMine(userId: string, ticketId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId },
      include: ticketInclude,
    });
    if (!ticket) throw new NotFoundException("تیکت یافت نشد.");
    return toPublicTicket(ticket, { includeThread: true });
  }

  async replyAsStudent(
    user: User,
    ticketId: string,
    dto: ReplyTicketDto,
  ) {
    const ticket = await this.requireTicket(ticketId);
    if (ticket.userId !== user.id) {
      throw new ForbiddenException("دسترسی به این تیکت ندارید.");
    }
    if (ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException(
        "تیکت بسته است. برای ادامه، درخواست بازگشایی دهید.",
      );
    }

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: user.id,
        authorRole: TicketAuthorRole.STUDENT,
        body: dto.body.trim(),
      },
    });

    if (dto.attachments?.length) {
      await this.persistAttachments({
        ticketId: ticket.id,
        messageId: message.id,
        uploadedById: user.id,
        items: dto.attachments,
      });
    }

    // Student reply while waiting → back to IN_PROGRESS
    if (ticket.status === TicketStatus.WAITING_FOR_USER) {
      await this.applyStatus(ticket.id, ticket.status, TicketStatus.IN_PROGRESS);
    } else {
      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: { updatedAt: new Date() },
      });
    }

    const owners = await this.prisma.user.findMany({
      where: { role: UserRole.OWNER },
      select: { id: true },
    });
    for (const owner of owners) {
      await this.notifications?.emit({
        userId: owner.id,
        eventType: NotificationEventType.TICKET_REPLY,
        context: { subject: ticket.subject, ticketId: ticket.id },
        payload: { ticketId: ticket.id, messageId: message.id },
      });
    }

    return this.getMine(user.id, ticket.id);
  }

  async adminList(filters: {
    status?: TicketStatus;
    q?: string;
    courseSlug?: string;
  }) {
    const items = await this.prisma.ticket.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.courseSlug
          ? { course: { slug: filters.courseSlug } }
          : {}),
        ...(filters.q?.trim()
          ? {
              OR: [
                {
                  subject: {
                    contains: filters.q.trim(),
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: filters.q.trim(),
                    mode: "insensitive",
                  },
                },
                {
                  user: {
                    username: {
                      contains: filters.q.trim(),
                      mode: "insensitive",
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        course: { select: { id: true, slug: true, title: true } },
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
          },
        },
        attachments: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    return { items: items.map((t) => toPublicTicket(t)) };
  }

  async adminGet(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: ticketInclude,
    });
    if (!ticket) throw new NotFoundException("تیکت یافت نشد.");
    return toPublicTicket(ticket, { includeThread: true });
  }

  async replyAsAdmin(admin: User, ticketId: string, dto: ReplyTicketDto) {
    const ticket = await this.requireTicket(ticketId);
    if (ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException("تیکت بسته است.");
    }

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: admin.id,
        authorRole: TicketAuthorRole.ADMIN,
        body: dto.body.trim(),
      },
    });

    if (dto.attachments?.length) {
      await this.persistAttachments({
        ticketId: ticket.id,
        messageId: message.id,
        uploadedById: admin.id,
        items: dto.attachments,
      });
    }

    // Admin reply on OPEN → IN_PROGRESS (taken)
    if (ticket.status === TicketStatus.OPEN) {
      await this.applyStatus(ticket.id, ticket.status, TicketStatus.IN_PROGRESS);
    } else {
      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: { updatedAt: new Date() },
      });
    }

    await this.notifications?.emit({
      userId: ticket.userId,
      eventType: NotificationEventType.TICKET_REPLY,
      context: { subject: ticket.subject, ticketId: ticket.id },
      payload: { ticketId: ticket.id, messageId: message.id },
    });

    return this.adminGet(ticket.id);
  }

  async transition(
    actor: User,
    ticketId: string,
    to: TicketStatus,
  ) {
    const ticket = await this.requireTicket(ticketId);
    const isOwner = actor.role === UserRole.OWNER;
    const isOwnerOfTicket = ticket.userId === actor.id;

    if (!isOwner) {
      // Students may only reopen CLOSED/RESOLVED → OPEN
      if (
        !(
          isOwnerOfTicket &&
          to === TicketStatus.OPEN &&
          (ticket.status === TicketStatus.CLOSED ||
            ticket.status === TicketStatus.RESOLVED)
        )
      ) {
        throw new ForbiddenException("تغییر وضعیت برای شما مجاز نیست.");
      }
    }

    try {
      assertTicketTransition(ticket.status, to);
    } catch {
      throw new BadRequestException(
        `انتقال وضعیت از ${ticket.status} به ${to} مجاز نیست.`,
      );
    }

    await this.applyStatus(ticket.id, ticket.status, to);

    await this.notifications?.emit({
      userId: ticket.userId,
      eventType: NotificationEventType.TICKET_STATUS_CHANGED,
      context: {
        subject: ticket.subject,
        ticketId: ticket.id,
        statusLabel: ticketStatusLabelFa(to),
      },
      payload: { ticketId: ticket.id, from: ticket.status, to },
    });

    if (isOwner) return this.adminGet(ticket.id);
    return this.getMine(actor.id, ticket.id);
  }

  async downloadAttachment(actor: User, attachmentId: string) {
    const attachment = await this.prisma.ticketAttachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true },
    });
    if (!attachment) throw new NotFoundException("پیوست یافت نشد.");

    const isOwner = actor.role === UserRole.OWNER;
    if (!isOwner && attachment.ticket.userId !== actor.id) {
      throw new ForbiddenException("دسترسی به این پیوست ندارید.");
    }

    const bytes = await this.storage.get(attachment.storageKey);
    return {
      fileName: attachment.fileName,
      contentType: attachment.contentType,
      bytes,
    };
  }

  private async applyStatus(
    ticketId: string,
    from: TicketStatus,
    to: TicketStatus,
  ) {
    assertTicketTransition(from, to);
    if (from === to) return;

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: to,
        resolvedAt:
          to === TicketStatus.RESOLVED
            ? new Date()
            : to === TicketStatus.OPEN
              ? null
              : undefined,
        closedAt:
          to === TicketStatus.CLOSED
            ? new Date()
            : to === TicketStatus.OPEN
              ? null
              : undefined,
      },
    });
  }

  private async requireTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException("تیکت یافت نشد.");
    return ticket;
  }

  private async persistAttachments(input: {
    ticketId: string;
    messageId: string | null;
    uploadedById: string;
    items: TicketAttachmentInputDto[];
  }) {
    for (const item of input.items) {
      const bytes = decodeBase64Payload(item.dataBase64);
      const meta = assertAllowedAttachment({
        contentType: item.contentType,
        sizeBytes: bytes.length,
        fileName: item.fileName,
      });
      assertAttachmentMagicBytes(meta.contentType, bytes);
      assertAttachmentContentSafe(meta.contentType, bytes);
      await this.clamav.assertClean(bytes);
      const storageKey = buildAttachmentStorageKey(input.ticketId, meta.ext);
      await this.storage.put(storageKey, bytes);
      await this.prisma.ticketAttachment.create({
        data: {
          ticketId: input.ticketId,
          messageId: input.messageId,
          uploadedById: input.uploadedById,
          storageKey,
          fileName: meta.safeFileName,
          contentType: meta.contentType,
          sizeBytes: bytes.length,
          contentSha256: sha256Hex(bytes),
        },
      });
    }
  }
}
