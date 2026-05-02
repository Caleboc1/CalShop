import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { reference } = await req.json();
    const tx = await prisma.transaction.findUnique({ where: { reference } });
    if (!tx || tx.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (tx.status === "COMPLETED") return NextResponse.json({ message: "Already credited", amount: tx.amount });
    const data = await verifyTransaction(reference);
    if (data.data?.status !== "success") return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    if (data.data?.reference !== reference) return NextResponse.json({ error: "Reference mismatch" }, { status: 400 });
    if (Number(data.data?.amount) !== Math.round(tx.amount * 100)) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }
    await prisma.$transaction([
      prisma.transaction.update({ where: { reference }, data: { status: "COMPLETED" } }),
      prisma.user.update({ where: { id: session.user.id }, data: { balance: { increment: tx.amount } } }),
    ]);
    return NextResponse.json({ message: "Wallet credited", amount: tx.amount });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
