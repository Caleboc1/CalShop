import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isValidSignature(payload: string, signature: string | null) {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
  const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(payload).digest("hex");
  return hash === signature;
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!isValidSignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(payload);

    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const reference = event.data?.reference as string | undefined;
    const paidAmount = Number(event.data?.amount ?? 0);

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const tx = await prisma.transaction.findUnique({ where: { reference } });

    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (tx.status === "COMPLETED") {
      return NextResponse.json({ received: true, alreadyCredited: true });
    }

    if (paidAmount !== Math.round(tx.amount * 100)) {
      await prisma.transaction.update({
        where: { reference },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.transaction.update({ where: { reference }, data: { status: "COMPLETED" } }),
      prisma.user.update({ where: { id: tx.userId }, data: { balance: { increment: tx.amount } } }),
    ]);

    return NextResponse.json({ received: true, credited: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
