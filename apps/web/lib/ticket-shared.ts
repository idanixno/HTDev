/** Client-safe ticket types + labels (no next/headers). */

export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FOR_USER"
  | "RESOLVED"
  | "CLOSED";

export type PublicTicket = {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  telegramRef: string | null;
  course: {
    id: string;
    slug: string;
    title: string;
    href: string;
  } | null;
  user?: {
    id: string;
    username: string;
    displayName: string;
    email: string;
  };
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  allowedTransitions: TicketStatus[];
  attachments?: {
    id: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    messageId: string | null;
    createdAt: string;
  }[];
  messages?: {
    id: string;
    authorRole: "STUDENT" | "ADMIN" | "SYSTEM";
    body: string;
    createdAt: string;
    author: {
      id: string;
      displayName: string;
      username: string;
    } | null;
    attachments: {
      id: string;
      fileName: string;
      contentType: string;
      sizeBytes: number;
      messageId: string | null;
      createdAt: string;
    }[];
  }[];
};

export function ticketStatusLabel(status: TicketStatus): string {
  switch (status) {
    case "OPEN":
      return "باز";
    case "IN_PROGRESS":
      return "در حال رسیدگی";
    case "WAITING_FOR_USER":
      return "در انتظار پاسخ شما";
    case "RESOLVED":
      return "حل‌شده";
    case "CLOSED":
      return "بسته";
    default:
      return status;
  }
}

export function ticketStatusBadge(
  status: TicketStatus,
): "success" | "pending" | "failure" | "information" {
  switch (status) {
    case "RESOLVED":
      return "success";
    case "CLOSED":
      return "failure";
    case "IN_PROGRESS":
    case "WAITING_FOR_USER":
      return "pending";
    default:
      return "information";
  }
}
