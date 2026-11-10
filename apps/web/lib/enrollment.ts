import { fetchMyOrders } from "./commerce";
import { fetchMySpotAccess } from "./spotplayer";

/** Courses the signed-in user actually owns (paid or free access) — never demo seeds. */
export async function ownedCourseSlugs(): Promise<Set<string>> {
  const [orders, access] = await Promise.all([
    fetchMyOrders(),
    fetchMySpotAccess(),
  ]);
  const slugs = new Set<string>();
  for (const order of orders) {
    if (order.status === "PAID" && order.course?.slug) {
      slugs.add(order.course.slug);
    }
  }
  for (const item of access?.items ?? []) {
    if (item.course?.slug) slugs.add(item.course.slug);
  }
  return slugs;
}

export async function userOwnsCourse(slug: string): Promise<boolean> {
  const owned = await ownedCourseSlugs();
  return owned.has(slug);
}
