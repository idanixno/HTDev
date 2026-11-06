import { redirect } from "next/navigation";
import { fetchCurrentUser, type PublicUser } from "../../lib/session";

/** Server-side OWNER gate — never rely on hidden URLs alone. */
export async function requireOwner(nextPath: string): Promise<PublicUser> {
  const user = await fetchCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  if (user.role !== "OWNER") {
    redirect("/dashboard");
  }
  return user;
}
