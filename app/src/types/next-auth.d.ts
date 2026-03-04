import "next-auth";

declare module "next-auth" {
  interface Session {
    provider?: string;
    providerAccountId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
    providerAccountId?: string;
  }
}
