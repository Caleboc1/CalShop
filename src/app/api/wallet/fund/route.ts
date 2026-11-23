import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdminOfFunding } from "@/lib/mailer";

const MIN_DEPOSIT = 5000;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const amount = Number(body.amount);
    const senderName = typeof body.senderName === "string" ? body.senderName.trim() : "";
    if (!Number.isFinite(amount) || amount < MIN_DEPOSIT) {
      return NextResponse.json({ error: `Minimum deposit is ₦${MIN_DEPOSIT}` }, { status: 400 });
    }
    if (!senderName || senderName.length > 120) {
      return NextResponse.json({ error: "Enter the name on the account you transferred from" }, { status: 400 });
    }

    const reference = `MAN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount,
        type: "CREDIT",
        method: "manual_transfer",
        reference,
        status: "PENDING",
        description: `Manual wallet funding; sender: ${senderName}`,
      },
      select: { id: true, amount: true, status: true, createdAt: true, reference: true },
    });

    await notifyAdminOfFunding({
      amount: transaction.amount,
      senderName,
      customerName: session.user.name || null,
      customerEmail: session.user.email || "",
      reference: transaction.reference || transaction.id,
      createdAt: transaction.createdAt,
    });

    return NextResponse.json({ message: "Transfer submitted for review", transaction }, { status: 201 });
  } catch (error) {
    console.error("Manual wallet funding submission failed:", error);
    return NextResponse.json({ error: "Could not submit transfer. Please try again." }, { status: 500 });
  }
}
