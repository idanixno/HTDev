import { NextResponse } from "next/server";
import { apiBaseUrl } from "../../../../../lib/auth-constants";

export async function POST(request: Request) {
  const body = await request.json();
  const upstream = await fetch(`${apiBaseUrl()}/identity/recover/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
