import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { finalizeGuestOrderPayment } from "@/lib/orders";

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();
    if (!reference) return NextResponse.json({ error: "Reference required" }, { status: 400 });

    const data = await verifyTransaction(reference);
    if (data.data?.status !== "success") {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }
    if (data.data?.reference !== reference) {
      return NextResponse.json({ error: "Reference mismatch" }, { status: 400 });
    }

    const result = await finalizeGuestOrderPayment({
      reference,
      paidAmount: Number(data.data?.amount ?? 0),
      metadata: data.data?.metadata,
    });

    return NextResponse.json({
      message: result.alreadyCompleted ? "Order already completed" : "Order completed",
      order: result.order,
      credentials: "credentials" in result ? result.credentials : result.order?.credentials,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    const status = message === "Transaction not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
