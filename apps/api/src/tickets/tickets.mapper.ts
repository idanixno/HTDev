import type {
  Course,
  Ticket,
  TicketAttachment,
  TicketMessage,
  User,
} from "@zharfa/database";
import { allowedTransitionsFrom } from "./ticket-status";

type TicketWithRelations = Ticket & {
  course?: Pick<Course, "id" | "slug" | "title"> | null;
  user?: Pick<User, "id" | "username" | "displayName" | "email">;
  messages?: (TicketMessage & {
    author?: Pick<User, "id" | "displayName" | "username"> | null;
    attachments?: TicketAttachment[];
  })[];
  attachments?: TicketAttachment[];
};

function mapAttachment(a: TicketAttachment) {
  return {
    id: a.id,
    fileName: a.fileName,
    contentType: a.contentType,
    sizeBytes: a.sizeBytes,
    messageId: a.messageId,
    createdAt: a.createdAt,
    // Never expose storageKey or filesystem paths to clients.
  };
}

function mapMessage(
  m: TicketMessage & {
    author?: Pick<User, "id" | "displayName" | "username"> | null;
    attachments?: TicketAttachment[];
  },
) {
  return {
    id: m.id,
    authorRole: m.authorRole,
    body: m.body,
    createdAt: m.createdAt,
    author: m.author
      ? {
          id: m.author.id,
          displayName: m.author.displayName,
          username: m.author.username,
        }
      : null,
    attachments: (m.attachments ?? []).map(mapAttachment),
  };
}

export function toPublicTicket(
  ticket: TicketWithRelations,
  opts?: { includeThread?: boolean },
) {
  return {
    id: ticket.id,
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    telegramRef: ticket.telegramRef,
    course: ticket.course
      ? {
          id: ticket.course.id,
          slug: ticket.course.slug,
          title: ticket.course.title,
          href: `/courses/${ticket.course.slug}`,
        }
      : null,
    user: ticket.user
      ? {
          id: ticket.user.id,
          username: ticket.user.username,
          displayName: ticket.user.displayName,
          email: ticket.user.email,
        }
      : undefined,
    resolvedAt: ticket.resolvedAt,
    closedAt: ticket.closedAt,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    allowedTransitions: allowedTransitionsFrom(ticket.status),
    attachments: (ticket.attachments ?? [])
      .filter((a) => !a.messageId)
      .map(mapAttachment),
    messages: opts?.includeThread
      ? (ticket.messages ?? []).map(mapMessage)
      : undefined,
  };
}
