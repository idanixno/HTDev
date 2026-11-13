import { proxyAdminJson } from "../../../../lib/admin-proxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  return proxyAdminJson(
    request,
    `/admin/topics${qs ? `?${qs}` : ""}`,
    "GET",
  );
}

export async function POST(request: Request) {
  return proxyAdminJson(request, "/admin/topics", "POST");
}
