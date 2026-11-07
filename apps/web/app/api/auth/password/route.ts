import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiBaseUrl, SESSION_COOKIE_NAME } from "../../../../lib/auth-constants";
import { assertSameOrigin } from "../../../../lib/csrf";
import { sessionCookieOptions } from "../../../../lib/session-cookie";

export async function POST(request: Request) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ message: "ورود لازم است." }, { status: 401 });
  }

  const res = await fetch(`${apiBaseUrl()}/identity/password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-session-token": token,
    },
    body: await request.text(),
  });

  const data = await res.json().catch(() => ({ message: "خطای سرور" }));
  const response = NextResponse.json(data, { status: res.status });
  if (res.ok) {
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      ...sessionCookieOptions(),
      maxAge: 0,
    });
  }
  return response;
}
