import { proxyAdminJson } from "../../../../../lib/admin-proxy";

export async function GET(request: Request) {
  return proxyAdminJson(request, "/admin/seo/content-audit", "GET");
}
