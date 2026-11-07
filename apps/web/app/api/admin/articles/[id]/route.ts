import { proxyAdminJson } from "../../../../../lib/admin-proxy";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  return proxyAdminJson(
    request,
    `/admin/articles/${encodeURIComponent(id)}`,
    "PATCH",
  );
}
