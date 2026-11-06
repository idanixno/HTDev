import { NextResponse } from "next/server";
import { apiBaseUrl } from "../../../lib/auth-constants";
import { getSessionToken } from "../../../lib/session";

export async function GET(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "ورود لازم است." }, { status: 401 });
  }
  const url = new URL(request.url);
  const res = await fetch(`${apiBaseUrl()}/notifications${url.search}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-session-token": token,
    },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
