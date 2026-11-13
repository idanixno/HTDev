import { proxyAdminJson } from "../../../../lib/admin-proxy";

export async function POST(request: Request) {
  return proxyAdminJson(request, "/admin/courses", "POST");
}
