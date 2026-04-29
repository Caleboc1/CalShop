import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProducts, getCategories } from "@/lib/acctshop";

const USD_TO_NGN = parseFloat(process.env.USD_TO_NGN || "1620");
const MARKUP = parseFloat(process.env.MARKUP || "2.2");

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const [rawProducts, rawCategories] = await Promise.all([getProducts(), getCategories()]);
    const products = Array.isArray(rawProducts) ? rawProducts : rawProducts?.data || [];
    const categories = Array.isArray(rawCategories) ? rawCategories : rawCategories?.data || [];

    let created = 0, skipped = 0;

    for (const cat of categories) {
      const slug = (cat.name || cat.title || `cat-${cat.id}`).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await prisma.category.upsert({
        where: { slug },
        update: { name: cat.name || cat.title },
        create: { name: cat.name || cat.title, slug, sortOrder: cat.id || 0 },
      });
    }

    for (const p of products) {
      const existing = await prisma.product.findFirst({ where: { upstreamId: String(p.id) } });
      if (existing) { skipped++; continue; }

      const catSlug = (p.category_name || p.category || "general").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      let category = await prisma.category.findFirst({ where: { slug: catSlug } });
      if (!category) {
        category = await prisma.category.create({
          data: { name: p.category_name || p.category || "General", slug: catSlug, sortOrder: 0 },
        });
      }

      const upstreamPrice = parseFloat(p.price || p.cost || "1");
      const yourPrice = Math.ceil(upstreamPrice * USD_TO_NGN * MARKUP);

      await prisma.product.create({
        data: {
          categoryId: category.id,
          name: p.name || p.title,
          description: p.description || "",
          price: yourPrice,
          upstreamId: String(p.id),
          upstreamPrice,
          stockCount: parseInt(p.stock || p.quantity || "0"),
          isActive: true,
        },
      });
      created++;
    }

    return NextResponse.json({ created, skipped, total: products.length });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
