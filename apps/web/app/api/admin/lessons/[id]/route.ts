import { proxyAdminJson } from "../../../../../lib/admin-proxy";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  return proxyAdminJson(
    request,
    `/admin/lessons/${encodeURIComponent(id)}`,
    "PATCH",
  );
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  return proxyAdminJson(
    request,
    `/admin/lessons/${encodeURIComponent(id)}`,
    "DELETE",
  );
}
