import { NextResponse } from "next/server";
import { apiBaseUrl } from "../../../../../lib/auth-constants";
import { assertSameOrigin } from "../../../../../lib/csrf";
import { getSessionToken } from "../../../../../lib/session";

export async function POST(request: Request) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "ورود لازم است." }, { status: 401 });
  }
  const body = await request.json();
  const res = await fetch(`${apiBaseUrl()}/spotplayer/access/free`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-session-token": token,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
