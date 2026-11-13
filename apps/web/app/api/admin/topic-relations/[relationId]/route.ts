import { proxyAdminJson } from "../../../../../lib/admin-proxy";

type Ctx = { params: Promise<{ relationId: string }> };

export async function DELETE(request: Request, ctx: Ctx) {
  const { relationId } = await ctx.params;
  return proxyAdminJson(
    request,
    `/admin/topic-relations/${encodeURIComponent(relationId)}`,
    "DELETE",
  );
}