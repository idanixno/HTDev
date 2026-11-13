import { proxyAdminJson } from "../../../../lib/admin-proxy";
import {
  peekTopicIdsInRequest,
  revalidateAfterTopicLinkChange,
} from "../../../../lib/revalidate-topics";

export async function POST(request: Request) {
  const { bodyText, hasTopicIds } = await peekTopicIdsInRequest(request);
  const res = await proxyAdminJson(request, "/admin/courses", "POST", {
    bodyText,
  });
  if (res.ok && hasTopicIds) {
    revalidateAfterTopicLinkChange();
  }
  return res;
}
