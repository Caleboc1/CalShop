import "next-auth";
declare module "next-auth" {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; role?: string; balance?: number; };
  }
  interface User { id: string; role?: string; balance?: number; }
}
declare module "next-auth/jwt" {
  interface JWT { id?: string; role?: string; balance?: number; }
}
