import { AccountProfileSettings } from "../../../components/account-profile-settings";
import { requireOwner } from "../../../components/admin/require-owner";

export default async function AdminAccountPage() {
  const user = await requireOwner();
  return <AccountProfileSettings user={user} roleLabel="مدیر" />;
}
