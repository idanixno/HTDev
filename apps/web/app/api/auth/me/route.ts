import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiBaseUrl, SESSION_COOKIE_NAME } from "../../../../lib/auth-constants";
import { assertSameOrigin } from "../../../../lib/csrf";
import { fetchCurrentUser } from "../../../../lib/session";

export async function GET() {
  const user = await fetchCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ message: "ورود لازم است." }, { status: 401 });
  }

  const res = await fetch(`${apiBaseUrl()}/identity/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-session-token": token,
    },
    body: await request.text(),
  });

  const data = await res.json().catch(() => ({ message: "خطای سرور" }));
  return NextResponse.json(data, { status: res.status });
}
