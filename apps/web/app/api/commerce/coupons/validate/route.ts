import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiBaseUrl, SESSION_COOKIE_NAME } from "../../../../../lib/auth-constants";

export async function POST(request: Request) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ message: "ورود لازم است." }, { status: 401 });
  }

  const body = await request.json();
  const upstream = await fetch(`${apiBaseUrl()}/commerce/coupons/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-session-token": token,
    },
    body: JSON.stringify(body),
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
