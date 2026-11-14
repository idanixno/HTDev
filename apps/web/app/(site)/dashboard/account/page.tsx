import { AccountProfileSettings } from "../../../../components/account-profile-settings";
import { fetchCurrentUser } from "../../../../lib/session";

export default async function AccountPage() {
  const user = await fetchCurrentUser();
  if (!user) return null;

  return <AccountProfileSettings user={user} roleLabel="دانشجو" />;
}
