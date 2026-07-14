import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fulfillPaidOrder } from "@/lib/orders";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where: { userId: session.user.id } }),
  ]);
  return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { productId, quantity = 1 } = await req.json();
    if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (quantity < 1) {
      return NextResponse.json({ error: "Minimum order is 1" }, { status: 400 });
    }
    if (quantity > product.maxOrder) {
      return NextResponse.json({ error: `Maximum order is ${product.maxOrder}` }, { status: 400 });
    }
    if (product.stockCount < quantity) return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });

    const charge = product.price * quantity;
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || user.balance < charge) return NextResponse.json({ error: "Insufficient balance" }, { status: 402 });

    const { order, credentials } = await fulfillPaidOrder({
      userId: session.user.id,
      productId,
      quantity,
      charge,
    });

    await prisma.$transaction([
      prisma.user.update({ where: { id: session.user.id }, data: { balance: { decrement: charge } } }),
      prisma.transaction.create({
        data: { userId: session.user.id, amount: charge, type: "DEBIT", description: `Purchase: ${product.name}`, status: "COMPLETED" },
      }),
    ]);

    return NextResponse.json({ order, credentials }, { status: 201 });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
