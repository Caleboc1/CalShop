import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(categoryId ? { categoryId } : {}),
      ...(featured === "true" ? { featured: true } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}
