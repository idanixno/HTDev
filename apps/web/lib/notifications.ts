import { apiBaseUrl } from "./auth-constants";
import { getSessionToken } from "./session";

export type PublicNotification = {
  id: string;
  eventType: string;
  title: string;
  body: string;
  payload: unknown;
  readAt: string | null;
  createdAt: string;
  deliveries: {
    id: string;
    channel: string;
    status: string;
    templateKey: string;
    sentAt: string | null;
    error: string | null;
  }[];
};

export type NotificationsList = {
  items: PublicNotification[];
  unreadCount: number;
};

async function authHeaders(): Promise<HeadersInit> {
  const token = await getSessionToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    "x-session-token": token,
  };
}

export async function fetchNotifications(): Promise<NotificationsList> {
  try {
    const res = await fetch(`${apiBaseUrl()}/notifications`, {
      headers: await authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return { items: [], unreadCount: 0 };
    return (await res.json()) as NotificationsList;
  } catch {
    return { items: [], unreadCount: 0 };
  }
}
