import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as { role?: string } | undefined)?.role === "ADMIN";
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const funding = await prisma.transaction.findMany({
    where: { method: "manual_transfer" },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json(funding);
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { transactionId, action } = await req.json();
    if (typeof transactionId !== "string" || !["approve", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid funding action" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const funding = await tx.transaction.findUnique({ where: { id: transactionId } });
      if (!funding || funding.method !== "manual_transfer" || funding.type !== "CREDIT") {
        return { error: "Funding request not found", status: 404 };
      }
      if (funding.status !== "PENDING") {
        return { error: `Request already ${funding.status.toLowerCase()}`, status: 409 };
      }

      const changed = await tx.transaction.updateMany({
        where: { id: funding.id, status: "PENDING" },
        data: { status: action === "approve" ? "COMPLETED" : "FAILED" },
      });
      if (changed.count !== 1) return { error: "Request was already processed", status: 409 };

      if (action === "approve") {
        await tx.user.update({ where: { id: funding.userId }, data: { balance: { increment: funding.amount } } });
      }
      return { success: true };
    });

    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Manual funding review failed:", error);
    return NextResponse.json({ error: "Could not process funding request" }, { status: 500 });
  }
}
