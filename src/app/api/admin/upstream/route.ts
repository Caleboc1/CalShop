import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProducts, getCategories, getAccountInfo } from "@/lib/acctshop";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const [products, categories, account] = await Promise.all([
    getProducts().catch(() => []),
    getCategories().catch(() => []),
    getAccountInfo().catch(() => null),
  ]);
  return NextResponse.json({ products, categories, account });
}
