import { NextResponse } from "next/server";
import { apiBaseUrl } from "../../../../lib/auth-constants";
import { assertSameOrigin } from "../../../../lib/csrf";
import { getSessionToken } from "../../../../lib/session";

export async function POST(request: Request) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "ورود لازم است." }, { status: 401 });
  }
  const res = await fetch(`${apiBaseUrl()}/notifications/read-all`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-session-token": token,
    },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
