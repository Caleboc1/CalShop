// app/api/acctshop/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCategoriesAndProducts, getAccountInfo } from "@/lib/acctshop";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [data, account] = await Promise.all([
      getCategoriesAndProducts().catch(() => ({ categories: [], products: [] })),
      getAccountInfo().catch(() => null),
    ]);

    return NextResponse.json({ 
      categories: data.categories,
      products: data.products,
      account 
    });
  } catch (error) {
    console.error("Acctshop API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from Acctshop" },
      { status: 500 }
    );
  }
}