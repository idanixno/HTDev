import { apiBaseUrl } from "./auth-constants";
import { getSessionToken } from "./session";
import type { PublicTicket, TicketStatus } from "./ticket-shared";

export type { PublicTicket, TicketStatus } from "./ticket-shared";
export {
  ticketStatusBadge,
  ticketStatusLabel,
} from "./ticket-shared";

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
