import Dashboard from "@/components/Dashboard";
import { requirePageUser } from "@/lib/pageAuth";

export default async function Home() {
  await requirePageUser();
  return <Dashboard />;
}
