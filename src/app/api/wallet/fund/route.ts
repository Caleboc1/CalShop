import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { amount } = await req.json();
    if (!amount || amount < 100) return NextResponse.json({ error: "Minimum deposit is ₦100" }, { status: 400 });
    const reference = `ACM-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    await prisma.transaction.create({
      data: { userId: session.user.id, amount, type: "CREDIT", method: "paystack", reference, status: "PENDING", description: "Wallet top-up" },
    });
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet?ref=${reference}`;
    const data = await initializeTransaction(session.user.email!, amount, reference, callbackUrl);
    if (!data.status) return NextResponse.json({ error: "Payment init failed" }, { status: 500 });
    return NextResponse.json({ url: data.data.authorization_url, reference });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
