import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";

const config: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId:     process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: "Email & Password",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${BACKEND}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email:    credentials.email,
              password: credentials.password,
            }),
          });
          if (!res.ok) return null;
          const user = await res.json() as {
            id: string; name: string; email: string; role: string;
          };
          if (!user?.email) return null;
          // Only allow ADMIN role to sign in to the admin app
          if (user.role !== "ADMIN") return null;
          return user;
        } catch { return null; }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        token.id    = user.id;
        token.email = user.email;
        token.name  = user.name;
        // Role comes from the login endpoint directly
        token.role  = (user as Record<string, unknown>).role ?? "USER";
      }
      if (profile) {
        token.name  = profile.name  ?? token.name;
        token.email = profile.email ?? token.email;
      }
      // Always fetch role from backend for Google sign-ins
      // For credentials sign-in, role is already on the token from authorize()
      if (token.email && (account?.provider === "google" || !token.role)) {
        try {
          const res = await fetch(`${BACKEND}/api/admin/role-check`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-secret": process.env.AUTH_SECRET ?? "",
            },
            body: JSON.stringify({ email: token.email }),
            cache: "no-store",
          });
          if (res.ok) {
            const data = await res.json() as { role: string };
            token.role = data.role;
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
    async signIn({ user, account }) {
      // For Google sign-in, check role before allowing access
      if (account?.provider === "google") {
        try {
          const res = await fetch(`${BACKEND}/api/admin/role-check`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-secret": process.env.AUTH_SECRET ?? "",
            },
            body: JSON.stringify({ email: user.email }),
            cache: "no-store",
          });
          if (!res.ok) return "/login?error=AccessDenied";
          const data = await res.json() as { role: string };
          if (data.role !== "ADMIN") return "/login?error=AccessDenied";
          return true;
        } catch {
          return "/login?error=AccessDenied";
        }
      }
      return true;
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
