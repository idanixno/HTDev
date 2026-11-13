import { proxyAdminJson } from "../../../../../lib/admin-proxy";
import {
  peekTopicIdsInRequest,
  revalidateAfterTopicLinkChange,
} from "../../../../../lib/revalidate-topics";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  const { bodyText, hasTopicIds } = await peekTopicIdsInRequest(request);
  const res = await proxyAdminJson(
    request,
    `/admin/articles/${encodeURIComponent(id)}`,
    "PATCH",
    { bodyText },
  );
  if (res.ok && hasTopicIds) {
    revalidateAfterTopicLinkChange();
  }
  return res;
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  return proxyAdminJson(
    request,
    `/admin/articles/${encodeURIComponent(id)}`,
    "DELETE",
  );
}
