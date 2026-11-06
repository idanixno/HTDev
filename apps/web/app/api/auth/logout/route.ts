import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiBaseUrl, SESSION_COOKIE_NAME } from "../../../../lib/auth-constants";

export async function POST() {
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
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
