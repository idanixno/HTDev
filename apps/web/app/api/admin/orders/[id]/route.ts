import { proxyAdminJson } from "../../../../../lib/admin-proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyAdminJson(
    request,
    `/admin/orders/${encodeURIComponent(id)}`,
    "PATCH",
  );
}
