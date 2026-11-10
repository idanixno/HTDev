import { NextResponse } from "next/server";
import { apiBaseUrl } from "../../../../lib/auth-constants";
import { assertSameOrigin } from "../../../../lib/csrf";
import { OWNER_MARKER_COOKIE } from "../../../../lib/owner-marker";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "../../../../lib/session-cookie";

export async function POST(request: Request) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const body = await request.json();
  const upstream = await fetch(`${apiBaseUrl()}/identity/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const sessionToken =
    upstream.headers.get("x-session-token") ||
    (typeof data.sessionToken === "string" ? data.sessionToken : null);
  if (!sessionToken) {
    return NextResponse.json(
      { message: "نشست برقرار نشد." },
      { status: 502 },
    );
  }

  const res = NextResponse.json({ user: data.user });
  const cookieOpts = sessionCookieOptions(
    data.expiresAt ? new Date(data.expiresAt as string) : undefined,
  );
  res.cookies.set(SESSION_COOKIE_NAME, sessionToken, cookieOpts);
  res.cookies.set(OWNER_MARKER_COOKIE, "", { ...cookieOpts, maxAge: 0 });
  return res;
}
