import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role, balance: user.balance };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) { token.id = user.id; token.role = (user as any).role; token.balance = (user as any).balance; }
      if (trigger === "update" && session?.balance !== undefined) token.balance = session.balance;
      return token;
    },
    async session({ session, token }) {
      if (token) { session.user.id = token.id as string; (session.user as any).role = token.role; (session.user as any).balance = token.balance; }
      return session;
    },
  },
};
