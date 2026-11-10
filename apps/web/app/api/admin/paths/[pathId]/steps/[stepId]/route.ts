import { proxyAdminJson } from "../../../../../../../lib/admin-proxy";

type Params = Promise<{ pathId: string; stepId: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { pathId, stepId } = await params;
  return proxyAdminJson(
    request,
    `/admin/paths/${encodeURIComponent(pathId)}/steps/${encodeURIComponent(stepId)}`,
    "PATCH",
  );
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  const { pathId, stepId } = await params;
  return proxyAdminJson(
    request,
    `/admin/paths/${encodeURIComponent(pathId)}/steps/${encodeURIComponent(stepId)}`,
    "DELETE",
  );
}
