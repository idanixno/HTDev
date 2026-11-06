import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiBaseUrl } from "../../../../lib/auth-constants";
import { assertSameOrigin } from "../../../../lib/csrf";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "../../../../lib/session-cookie";

export async function POST(request: Request) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await fetch(`${apiBaseUrl()}/identity/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-session-token": token,
      },
    }).catch(() => undefined);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return res;
}
