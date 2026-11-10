import { notFound } from "next/navigation";
import { fetchCurrentUser, type PublicUser } from "../../lib/session";

/** Owner-only gate. Everyone else gets the same 404 as a missing page. */
export async function requireOwner(): Promise<PublicUser> {
  const user = await fetchCurrentUser();
  if (!user || user.role !== "OWNER") notFound();
  return user;
}
