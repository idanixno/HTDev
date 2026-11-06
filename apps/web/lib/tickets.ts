import { apiBaseUrl } from "./auth-constants";
import { getSessionToken } from "./session";

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

async function authHeaders(): Promise<HeadersInit> {
  const token = await getSessionToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    "x-session-token": token,
  };
}

export async function fetchMyTickets(
  status?: TicketStatus,
): Promise<PublicTicket[]> {
  try {
    const qs = status ? `?status=${status}` : "";
    const res = await fetch(`${apiBaseUrl()}/tickets${qs}`, {
      headers: await authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { items: PublicTicket[] };
    return data.items ?? [];
  } catch {
    return [];
  }
}

export async function fetchTicket(id: string): Promise<PublicTicket | null> {
  try {
    const res = await fetch(`${apiBaseUrl()}/tickets/${id}`, {
      headers: await authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicTicket;
  } catch {
    return null;
  }
}

export async function fetchAdminTickets(opts?: {
  status?: TicketStatus;
  q?: string;
}): Promise<PublicTicket[]> {
  try {
    const params = new URLSearchParams();
    if (opts?.status) params.set("status", opts.status);
    if (opts?.q) params.set("q", opts.q);
    const qs = params.toString() ? `?${params}` : "";
    const res = await fetch(`${apiBaseUrl()}/tickets/admin${qs}`, {
      headers: await authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { items: PublicTicket[] };
    return data.items ?? [];
  } catch {
    return [];
  }
}

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
