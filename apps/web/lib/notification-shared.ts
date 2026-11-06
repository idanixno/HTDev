/** Client-safe notification types (no next/headers). */

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
