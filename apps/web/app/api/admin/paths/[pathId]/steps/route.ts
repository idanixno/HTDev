import { proxyAdminJson } from "../../../../../../lib/admin-proxy";

type Ctx = { params: Promise<{ pathId: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const { pathId } = await ctx.params;
  return proxyAdminJson(
    request,
    `/admin/paths/${encodeURIComponent(pathId)}/steps`,
    "POST",
  );
}
