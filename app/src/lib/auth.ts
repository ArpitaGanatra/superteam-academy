import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/settings",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }
      if (profile) {
        token.name = profile.name ?? token.name;
        token.picture =
          ((profile as Record<string, unknown>).avatar_url as string) ??
          ((profile as Record<string, unknown>).picture as string) ??
          token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        provider: token.provider as string | undefined,
        providerAccountId: token.providerAccountId as string | undefined,
      };
    },
  },
};
