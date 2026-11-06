import { NextResponse } from "next/server";
import { apiBaseUrl } from "../../../lib/auth-constants";
import { getSessionToken } from "../../../lib/session";

export async function GET(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "ورود لازم است." }, { status: 401 });
  }
  const url = new URL(request.url);
  const res = await fetch(`${apiBaseUrl()}/tickets${url.search}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-session-token": token,
    },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "ورود لازم است." }, { status: 401 });
  }
  const body = await request.json();
  const res = await fetch(`${apiBaseUrl()}/tickets`, {
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
