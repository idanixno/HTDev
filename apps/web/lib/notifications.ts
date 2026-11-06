import { apiBaseUrl } from "./auth-constants";
import { getSessionToken } from "./session";
import type { NotificationsList } from "./notification-shared";

export type {
  NotificationsList,
  PublicNotification,
} from "./notification-shared";

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
