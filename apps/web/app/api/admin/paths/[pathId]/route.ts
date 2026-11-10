import { proxyAdminJson } from "../../../../../lib/admin-proxy";

type Ctx = { params: Promise<{ pathId: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const { pathId } = await ctx.params;
  return proxyAdminJson(
    request,
    `/admin/paths/${encodeURIComponent(pathId)}`,
    "PATCH",
  );
}

export async function DELETE(request: Request, ctx: Ctx) {
  const { pathId } = await ctx.params;
  return proxyAdminJson(
    request,
    `/admin/paths/${encodeURIComponent(pathId)}`,
    "DELETE",
  );
}
