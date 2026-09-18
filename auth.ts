import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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
        if (
          typeof credentials?.email    !== "string" ||
          typeof credentials?.password !== "string"
        ) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.trim().toLowerCase() },
          });
          if (!user || !user.password) return null;
          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) return null;
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        token.id    = user.id;
        token.name  = user.name;
        token.email = user.email;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role  = (user as any).role ?? "USER";
      }
      if (profile) {
        token.name  = profile.name  ?? token.name;
        token.email = profile.email ?? token.email;
        token.picture = (profile as { picture?: string }).picture ?? undefined;
      }
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, role: true },
          });
          if (dbUser) {
            token.id   = dbUser.id;
            token.role = dbUser.role;
          }
        } catch { /* DB unavailable — keep existing token */ }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id    = (token.id    as string) ?? "";
        session.user.name  = (token.name  as string) ?? session.user.name;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.image = (token.picture as string | undefined) ?? session.user.image;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role ?? "USER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(config);
