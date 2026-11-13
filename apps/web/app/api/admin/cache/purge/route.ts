import { NextResponse } from "next/server";
import { assertSameOrigin } from "../../../../../lib/csrf";
import { fetchCurrentUser } from "../../../../../lib/session";
import { purgeAll } from "../../../../../lib/site-cache";

export async function POST(request: Request) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const user = await fetchCurrentUser();
  if (user?.role !== "OWNER") {
    return NextResponse.json({ message: "یافت نشد." }, { status: 404 });
  }

  purgeAll();
  return NextResponse.json(
    { ok: true, purgedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
