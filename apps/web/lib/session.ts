import { cookies } from "next/headers";
import { apiBaseUrl, SESSION_COOKIE_NAME } from "./auth-constants";

export type PublicUser = {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  displayName: string;
  telegramHandle: string | null;
  githubHandle: string | null;
  role: "STUDENT" | "OWNER";
  emailVerified: boolean;
  phoneVerified: boolean;
};

export async function getSessionToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE_NAME)?.value;
}

export async function fetchCurrentUser(): Promise<PublicUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const res = await fetch(`${apiBaseUrl()}/identity/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-session-token": token,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: PublicUser };
    return data.user;
  } catch {
    return null;
  }
}
