// app/api/admin/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCategoriesAndProducts } from "@/lib/acctshop";

const USD_TO_NGN = parseFloat(process.env.USD_TO_NGN || "1620");
const MARKUP = parseFloat(process.env.MARKUP || "2.2");
const BATCH_SIZE = 100;

type SyncProduct = {
  id: string | number;
  name: string;
  description?: string;
  price?: string | number;
  max?: string | number;
  amount?: string | number;
};

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "uncategorized";
}

function chunks<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { categories: rawCategories, products: rawProducts } = await getCategoriesAndProducts();
    const categories = Array.isArray(rawCategories) ? rawCategories : [];
    const products = Array.isArray(rawProducts) ? rawProducts as SyncProduct[] : [];

    const categoryByProductId = new Map<string, string>();
    const categoryRows = categories.map((cat: any) => {
      const name = String(cat.name || cat.title || `Category ${cat.id}`);
      for (const product of cat.products || []) categoryByProductId.set(String(product.id), name);
      return { name, slug: slugify(name), sortOrder: parseInt(String(cat.id), 10) || 0 };
    });
    const distinctCategories = Array.from(new Map(categoryRows.map((row) => [row.slug, row])).values());
    const categorySlugs = distinctCategories.map((row) => row.slug);
    const existingCategories = await prisma.category.findMany({
      where: { slug: { in: categorySlugs } },
      select: { id: true, slug: true },
    });
    const categoryBySlug = new Map<string, string>(
      existingCategories.map((category: { id: string; slug: string }) => [category.slug, category.id])
    );
    const missingCategories = distinctCategories.filter((row) => !categoryBySlug.has(row.slug));
    for (const batch of chunks(missingCategories, BATCH_SIZE)) {
      await prisma.category.createMany({ data: batch });
    }
    const allCategories = await prisma.category.findMany({
      where: { slug: { in: categorySlugs } },
      select: { id: true, slug: true },
    });
    for (const category of allCategories as Array<{ id: string; slug: string }>) {
      categoryBySlug.set(category.slug, category.id);
    }

    let uncategorizedId = categoryBySlug.get("uncategorized");
    if (!uncategorizedId) {
      const category = await prisma.category.upsert({
        where: { slug: "uncategorized" },
        update: {},
        create: { name: "Uncategorized", slug: "uncategorized", sortOrder: 999 },
        select: { id: true },
      });
      uncategorizedId = category.id;
    }

    const upstreamIds = products.filter((product) => product?.id != null).map((product) => String(product.id));
    const existingProducts = await prisma.product.findMany({
      where: { upstreamId: { in: upstreamIds } },
      select: { id: true, upstreamId: true },
    });
    const existingByUpstreamId = new Map<string | null, string>(
      existingProducts.map((product: { id: string; upstreamId: string | null }) => [product.upstreamId, product.id])
    );
    const createRows: Array<Record<string, unknown>> = [];
    const updateRows: Array<{ id: string; data: Record<string, unknown> }> = [];

    for (const product of products) {
      if (product?.id == null || !product.name) continue;
      const upstreamPrice = Number(product.price);
      if (!Number.isFinite(upstreamPrice)) continue;
      const stockCount = Math.max(0, Math.trunc(Number(product.amount) || 0));
      const providerMax = Math.max(1, Math.trunc(Number(product.max) || 100));
      const maxOrder = Math.max(1, Math.min(providerMax, stockCount || providerMax));
      const categoryName = categoryByProductId.get(String(product.id));
      const categoryId = categoryName ? categoryBySlug.get(slugify(categoryName)) : uncategorizedId;
      const data = {
        categoryId: categoryId || uncategorizedId,
        name: product.name,
        description: product.description || "",
        price: Math.ceil(upstreamPrice * USD_TO_NGN * MARKUP),
        upstreamPrice,
        stockCount,
        minOrder: 1,
        maxOrder,
        isActive: stockCount > 0,
      };
      const existingId = existingByUpstreamId.get(String(product.id));
      if (existingId) updateRows.push({ id: existingId, data });
      else createRows.push({ ...data, upstreamId: String(product.id) });
    }

    for (const batch of chunks(createRows, BATCH_SIZE)) {
      await prisma.product.createMany({ data: batch as any[] });
    }
    for (const batch of chunks(updateRows, BATCH_SIZE)) {
      await Promise.all(batch.map(({ id, data }) => prisma.product.update({ where: { id }, data: data as any })));
    }

    return NextResponse.json({ 
      success: true,
      created: createRows.length,
      updated: updateRows.length,
      skipped: products.length - createRows.length - updateRows.length,
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
