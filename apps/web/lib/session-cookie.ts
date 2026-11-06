import { SESSION_COOKIE_NAME } from "./auth-constants";

export type SessionCookieFlags = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  expires?: Date;
  maxAge?: number;
};

/**
 * Shared session cookie flags for the Next BFF.
 * HttpOnly + SameSite=Lax; Secure only when NODE_ENV=production (HTTPS assumed).
 * Does not enable Secure in local NODE_ENV=development over HTTP.
 */
export function sessionCookieOptions(
  expiresAt?: Date | string | null,
): SessionCookieFlags {
  const expires =
    typeof expiresAt === "string"
      ? new Date(expiresAt)
      : expiresAt ?? undefined;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(expires ? { expires } : {}),
  };
}

export { SESSION_COOKIE_NAME };
