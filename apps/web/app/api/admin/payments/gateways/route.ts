import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiBaseUrl, SESSION_COOKIE_NAME } from "../../../../../lib/auth-constants";

export async function PATCH(request: Request) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ message: "ورود لازم است." }, { status: 401 });
  }

  const body = await request.text();
  const res = await fetch(`${apiBaseUrl()}/admin/payments/gateways`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-session-token": token,
    },
    body,
  });

  const data = await res.json().catch(() => ({ message: "خطای سرور" }));
  return NextResponse.json(data, { status: res.status });
}
