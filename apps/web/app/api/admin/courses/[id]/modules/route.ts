import { proxyAdminJson } from "../../../../../../lib/admin-proxy";

type Params = Promise<{ id: string }>;

export async function POST(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  return proxyAdminJson(
    request,
    `/admin/courses/${encodeURIComponent(id)}/modules`,
    "POST",
  );
}
