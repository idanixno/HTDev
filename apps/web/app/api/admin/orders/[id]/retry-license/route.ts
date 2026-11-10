import { proxyAdminJson } from "../../../../../../lib/admin-proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyAdminJson(
    request,
    `/admin/orders/${encodeURIComponent(id)}/retry-license`,
    "POST",
  );
}
