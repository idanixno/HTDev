import { proxyAdminJson } from "../../../../lib/admin-proxy";

export async function GET(request: Request) {
  return proxyAdminJson(request, "/admin/integrations", "GET");
}

export async function POST(request: Request) {
  return proxyAdminJson(request, "/admin/integrations", "POST");
}
