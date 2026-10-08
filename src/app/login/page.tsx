import AuthForm from "@/components/AuthForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth";
import { getUserForToken } from "@/lib/serverAuth";

export default async function LoginPage() {
  if (await getUserForToken((await cookies()).get(SESSION_COOKIE)?.value)) redirect("/");
  return <AuthForm />;
}
