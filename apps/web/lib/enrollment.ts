import { fetchMyOrders } from "./commerce";
import { SAMPLE_LICENSES } from "./sample-licenses";
import { fetchMySpotAccess } from "./spotplayer";

export async function userOwnsCourse(slug: string): Promise<boolean> {
  const [orders, access] = await Promise.all([
    fetchMyOrders(),
    fetchMySpotAccess(),
  ]);

  if (orders.some((order) => order.status === "PAID" && order.course.slug === slug)) {
    return true;
  }

  if (access?.items.some((item) => item.course?.slug === slug)) {
    return true;
  }

  return (
    process.env.NODE_ENV === "development" &&
    SAMPLE_LICENSES.some((item) => item.course.slug === slug)
  );
}
