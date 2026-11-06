import { apiBaseUrl } from "./auth-constants";
import {
  type CheckoutOptions,
  type PublicOrder,
} from "./commerce-shared";
import { getSessionToken } from "./session";

export type {
  CheckoutOptions,
  GatewayView,
  PublicOrder,
} from "./commerce-shared";
export { orderStatusLabel, providerLabel } from "./commerce-shared";

async function authHeaders(): Promise<HeadersInit> {
  const token = await getSessionToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    "x-session-token": token,
  };
}

export async function fetchCheckoutOptions(
  courseSlug: string,
): Promise<CheckoutOptions | null> {
  try {
    const res = await fetch(
      `${apiBaseUrl()}/commerce/checkout/${encodeURIComponent(courseSlug)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as CheckoutOptions;
  } catch {
    return null;
  }
}

export async function fetchMyOrders(): Promise<PublicOrder[]> {
  try {
    const res = await fetch(`${apiBaseUrl()}/commerce/orders`, {
      headers: await authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { items: PublicOrder[] };
    return data.items;
  } catch {
    return [];
  }
}

export async function fetchMyOrder(
  orderId: string,
): Promise<PublicOrder | null> {
  try {
    const res = await fetch(
      `${apiBaseUrl()}/commerce/orders/${encodeURIComponent(orderId)}`,
      {
        headers: await authHeaders(),
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as PublicOrder;
  } catch {
    return null;
  }
}
