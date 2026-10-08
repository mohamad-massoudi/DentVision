import ProfileView from "@/components/ProfileView";
import { requirePageUser } from "@/lib/pageAuth";

export default async function ProfilePage() {
  await requirePageUser();
  return <ProfileView />;
}
