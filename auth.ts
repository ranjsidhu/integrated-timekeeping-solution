import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authorizeUsers } from "@/utils/auth/authorizeUsers";
import { signInCallback } from "@/utils/auth/signInCallback";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      roles?: string[];
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        return await authorizeUsers(credentials);
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      return await signInCallback({ user, account });
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
});
