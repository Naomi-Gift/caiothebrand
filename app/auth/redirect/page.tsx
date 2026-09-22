/**
 * /auth/redirect — used as the callbackUrl for Google sign-in.
 * Reads the session role server-side and redirects to the right place.
 */
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AuthRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any)?.role;

  if (role === "ADMIN") {
    redirect("/admin");
  }

  redirect("/account");
}
