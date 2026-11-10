import { proxyAdminJson } from "../../../../../lib/admin-proxy";

export async function PATCH(request: Request) {
  return proxyAdminJson(request, "/admin/cms/home", "PATCH");
}
