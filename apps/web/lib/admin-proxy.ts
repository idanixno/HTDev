import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiBaseUrl, SESSION_COOKIE_NAME } from "./auth-constants";
import { assertSameOrigin } from "./csrf";

export async function proxyAdminJson(
  request: Request,
  apiPath: string,
  method: "POST" | "PATCH" | "DELETE",
) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ message: "ورود لازم است." }, { status: 401 });
  }

  const body = method === "DELETE" ? undefined : await request.text();
  const res = await fetch(`${apiBaseUrl()}${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "x-session-token": token,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body && body.length > 0 ? body : undefined,
  });

  const data = await res.json().catch(() => ({ message: "خطای سرور" }));
  return NextResponse.json(data, { status: res.status });
}
