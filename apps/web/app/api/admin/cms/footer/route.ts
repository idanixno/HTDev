import { proxyAdminJson } from "../../../../../lib/admin-proxy";

export async function GET(request: Request) {
  return proxyAdminJson(request, "/admin/cms/footer", "GET");
}

export async function PATCH(request: Request) {
  return proxyAdminJson(request, "/admin/cms/footer", "PATCH");
}
