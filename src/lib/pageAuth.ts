import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "./auth";
import { getUserForToken } from "./serverAuth";

export async function requirePageUser() {
  const user = await getUserForToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!user) redirect("/login");
  return user;
}
