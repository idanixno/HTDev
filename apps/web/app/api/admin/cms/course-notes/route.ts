import { proxyAdminJson } from "../../../../../lib/admin-proxy";

export async function GET(request: Request) {
  const qs = new URL(request.url).searchParams.toString();
  return proxyAdminJson(
    request,
    `/admin/cms/course-notes${qs ? `?${qs}` : ""}`,
    "GET",
  );
}

export async function POST(request: Request) {
  return proxyAdminJson(request, "/admin/cms/course-notes", "POST");
}
