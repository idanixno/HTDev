import { revalidateTopicSurfaces } from "../../../../lib/revalidate-topics";
import { proxyAdminJson } from "../../../../lib/admin-proxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  return proxyAdminJson(
    request,
    `/admin/topics${qs ? `?${qs}` : ""}`,
    "GET",
  );
}

export async function POST(request: Request) {
  const res = await proxyAdminJson(request, "/admin/topics", "POST");
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
