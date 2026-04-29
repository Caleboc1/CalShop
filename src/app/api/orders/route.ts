import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { purchaseProduct } from "@/lib/acctshop";

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
    if (product.stockCount < quantity) return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });

    const charge = product.price * quantity;
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || user.balance < charge) return NextResponse.json({ error: "Insufficient balance" }, { status: 402 });

    // Call Acctshop upstream to get credentials
    let credentials: string[] = [];
    let upstreamTransId: string | undefined;

    if (product.upstreamId) {
      const upstream = await purchaseProduct(product.upstreamId, quantity);
      if (upstream.status === "success" && upstream.data) {
        credentials = Array.isArray(upstream.data) ? upstream.data : [upstream.data];
        upstreamTransId = upstream.trans_id;
      } else {
        return NextResponse.json({ error: "Upstream fulfillment failed — try again" }, { status: 502 });
      }
    }

    // Atomic: deduct balance, create order, log transaction, update stock
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          userId: session.user.id,
          productId,
          quantity,
          charge,
          status: credentials.length > 0 ? "COMPLETED" : "PENDING",
          credentials,
          upstreamTransId,
        },
      }),
      prisma.user.update({ where: { id: session.user.id }, data: { balance: { decrement: charge } } }),
      prisma.product.update({ where: { id: productId }, data: { stockCount: { decrement: quantity } } }),
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
