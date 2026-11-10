import { NextResponse } from "next/server";
import { apiBaseUrl } from "../../../../../lib/auth-constants";

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "درخواست نامعتبر است." }, { status: 400 });
  }

  const res = await fetch(
    `${apiBaseUrl()}/catalog/courses/${encodeURIComponent(slug)}/waitlist`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
