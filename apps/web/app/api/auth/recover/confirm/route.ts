import { NextResponse } from "next/server";
import { apiBaseUrl } from "../../../../../lib/auth-constants";
import { assertSameOrigin } from "../../../../../lib/csrf";

export async function POST(request: Request) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const body = await request.json();
  const upstream = await fetch(`${apiBaseUrl()}/identity/recover/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
