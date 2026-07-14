import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";
import { getOrCreateCustomerForEmail } from "@/lib/orders";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const { productId, quantity = 1, email, name } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedName = String(name || "").trim();
    const qty = Number(quantity);

    if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    if (!isValidEmail(normalizedEmail)) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    if (!Number.isInteger(qty) || qty < 1) {
      return NextResponse.json({ error: "Minimum order is 1" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (qty > product.maxOrder) {
      return NextResponse.json({ error: `Maximum order is ${product.maxOrder}` }, { status: 400 });
    }
    if (product.stockCount < qty) return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });

    const user = await getOrCreateCustomerForEmail(normalizedEmail, normalizedName);
    const charge = product.price * qty;
    const reference = `GUEST-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: charge,
        type: "DEBIT",
        method: "paystack_guest_order",
        reference,
        status: "PENDING",
        description: `Guest purchase: ${product.name}`,
      },
    });

    const callbackUrl = new URL(`/shop/${productId}?guest_ref=${reference}`, req.nextUrl.origin).toString();
    const data = await initializeTransaction(normalizedEmail, charge, reference, callbackUrl, {
      purpose: "guest_order",
      productId,
      quantity: qty,
      customerEmail: normalizedEmail,
      customerName: normalizedName || undefined,
    });

    if (!data.status) return NextResponse.json({ error: "Payment init failed" }, { status: 500 });
    return NextResponse.json({ url: data.data.authorization_url, reference });
  } catch (err) {
    console.error("Guest checkout error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
