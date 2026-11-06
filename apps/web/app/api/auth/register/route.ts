import { NextResponse } from "next/server";
import { apiBaseUrl } from "../../../../lib/auth-constants";
import { assertSameOrigin } from "../../../../lib/csrf";
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

  const res = NextResponse.json({ user: data.user });
  res.cookies.set(
    SESSION_COOKIE_NAME,
    data.sessionToken as string,
    sessionCookieOptions(
      data.expiresAt ? new Date(data.expiresAt as string) : undefined,
    ),
  );
  return res;
}
