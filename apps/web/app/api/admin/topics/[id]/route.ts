import { revalidateTopicSurfaces } from "../../../../../lib/revalidate-topics";
import { proxyAdminJson } from "../../../../../lib/admin-proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyAdminJson(
    request,
    `/admin/topics/${encodeURIComponent(id)}`,
    "GET",
  );
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const res = await proxyAdminJson(
    request,
    `/admin/topics/${encodeURIComponent(id)}`,
    "PATCH",
  );
  if (res.ok) {
    try {
      const data = (await res.clone().json()) as { slug?: string };
      revalidateTopicSurfaces(data.slug);
    } catch {
      revalidateTopicSurfaces();
    }
  }
  return res;
}

export async function DELETE(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const res = await proxyAdminJson(
    request,
    `/admin/topics/${encodeURIComponent(id)}`,
    "DELETE",
  );
  if (res.ok) {
    revalidateTopicSurfaces();
  }
  return res;
}
