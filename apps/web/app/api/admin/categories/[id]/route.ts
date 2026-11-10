import { proxyAdminJson } from "../../../../../lib/admin-proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyAdminJson(
    request,
    `/admin/categories/${encodeURIComponent(id)}`,
    "PATCH",
  );
}

export async function DELETE(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyAdminJson(
    request,
    `/admin/categories/${encodeURIComponent(id)}`,
    "DELETE",
  );
}
