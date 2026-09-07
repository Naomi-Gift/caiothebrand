import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";

const config: NextAuthConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: "Email & Password",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (typeof credentials?.email !== "string" || typeof credentials?.password !== "string") return null;
        try {
          // Verify credentials against the backend auth endpoint
          const res = await fetch(`${BACKEND}/api/auth/callback/credentials`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          if (!res.ok) return null;
          const user = await res.json() as { id: string; name: string; email: string; role: string };
          if (!user?.email) return null;
          return user;
        } catch { return null; }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id    = user.id;
        token.email = user.email;
        token.name  = user.name;
      }
      // Fetch role from backend to confirm ADMIN on every refresh
      if (token.email) {
        try {
          const res = await fetch(`${BACKEND}/api/admin/users`, {
            headers: { "x-admin-check": "1", "x-user-email": token.email as string },
            cache: "no-store",
          });
          if (res.ok) {
            const users = await res.json() as Array<{ email: string; role: string }>;
            const me = users.find((u) => u.email === token.email);
            token.role = me?.role ?? "USER";
          }
        } catch { /* keep existing */ }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = (token.id as string) ?? "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session.user as any).role = token.role ?? "USER";
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(config);
