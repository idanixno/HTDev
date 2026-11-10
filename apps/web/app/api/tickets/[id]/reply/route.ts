import { NextResponse } from "next/server";
import { apiBaseUrl } from "../../../../../lib/auth-constants";
import { assertSameOrigin } from "../../../../../lib/csrf";
import { getSessionToken } from "../../../../../lib/session";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "ورود لازم است." }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await request.json();
  const res = await fetch(`${apiBaseUrl()}/tickets/${id}/reply`, {
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
