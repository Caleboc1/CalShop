// app/api/admin/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCategoriesAndProducts } from "@/lib/acctshop";

const USD_TO_NGN = parseFloat(process.env.USD_TO_NGN || "1620");
const MARKUP = parseFloat(process.env.MARKUP || "2.2");

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { categories: rawCategories, products: rawProducts } = await getCategoriesAndProducts();
    const categories = Array.isArray(rawCategories) ? rawCategories : [];
    const products = Array.isArray(rawProducts) ? rawProducts : [];

    let created = 0, updated = 0;

    // Sync categories
    for (const cat of categories) {
      const name = cat.name || cat.title || `Category ${cat.id}`;
      const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      
      await prisma.category.upsert({
        where: { slug },
        update: { name },
        create: { name, slug, sortOrder: parseInt(cat.id) || 0 },
      });
    }

    // Sync products using Acctshop's native payload shape.
    for (const p of products) {
      const upstreamPriceInUSD = parseFloat(p.price || "0");
      const minOrder = Math.max(1, parseInt(p.min?.toString() || "1", 10));
      const rawMaxOrder = parseInt(p.max?.toString() || "100", 10);
      const stockCount = parseInt(p.amount?.toString() || "0", 10);
      const maxOrder = Math.max(minOrder, Math.min(rawMaxOrder || 100, stockCount || rawMaxOrder || 100));
      
      const yourPriceInNGN = Math.ceil(upstreamPriceInUSD * USD_TO_NGN * MARKUP);
      
      const existing = await prisma.product.findFirst({ 
        where: { upstreamId: String(p.id) } 
      });
      
      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: p.name,
            description: p.description || "",
            price: yourPriceInNGN,
            upstreamPrice: upstreamPriceInUSD,
            stockCount,
            minOrder,
            maxOrder,
            isActive: p.amount > 0,
          },
        });
        updated++;
        continue;
      }

      // Find category for this product
      let categoryId: string | undefined;
      
      for (const cat of categories) {
        if (cat.products?.some((product: any) => String(product.id) === String(p.id))) {
          const categorySlug = cat.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          const category = await prisma.category.findFirst({ where: { slug: categorySlug } });
          if (category) {
            categoryId = category.id;
            break;
          }
        }
      }

      if (!categoryId) {
        let defaultCategory = await prisma.category.findFirst({ where: { slug: "uncategorized" } });
        if (!defaultCategory) {
          defaultCategory = await prisma.category.create({
            data: { name: "Uncategorized", slug: "uncategorized", sortOrder: 999 },
          });
        }
        categoryId = defaultCategory.id;
      }
      
      await prisma.product.create({
        data: {
          categoryId: categoryId,
          name: p.name,
          description: p.description || "",
          price: yourPriceInNGN,
          upstreamId: String(p.id),
          upstreamPrice: upstreamPriceInUSD,
          stockCount,
          minOrder,
          maxOrder,
          isActive: p.amount > 0,
        },
      });
      created++;
    }

    return NextResponse.json({ 
      success: true,
      created, 
      updated,
      totalCategories: categories.length,
      totalProducts: products.length,
    });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ 
      error: "Sync failed", 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}
