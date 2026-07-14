import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { purchaseProduct } from "@/lib/acctshop";

const GUEST_USER_PASSWORD_PREFIX = "guest:";

export async function getOrCreateCustomerForEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return existing;

  const password = await bcrypt.hash(
    `${GUEST_USER_PASSWORD_PREFIX}${crypto.randomUUID()}`,
    12
  );

  return prisma.user.create({
    data: {
      email: normalizedEmail,
      name: "Guest Customer",
      password,
      referralCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
    },
  });
}

export async function fulfillPaidOrder({
  userId,
  productId,
  quantity,
  charge,
  paymentReference,
}: {
  userId: string;
  productId: string;
  quantity: number;
  charge: number;
  paymentReference?: string;
}) {
  const product = await prisma.product.findUnique({
    where: { id: productId, isActive: true },
  });

  if (!product) throw new Error("Product not found");
  if (quantity < 1) throw new Error("Minimum order is 1");
  if (quantity > product.maxOrder) throw new Error(`Maximum order is ${product.maxOrder}`);
  if (product.stockCount < quantity) throw new Error("Insufficient stock");

  const expectedCharge = product.price * quantity;
  if (Math.round(expectedCharge * 100) !== Math.round(charge * 100)) {
    throw new Error("Amount mismatch");
  }

  let credentials: string[] = [];
  let upstreamTransId: string | undefined;

  if (product.upstreamId) {
    const upstream = await purchaseProduct(product.upstreamId, quantity);
    if (upstream.status === "success" && upstream.data) {
      credentials = Array.isArray(upstream.data) ? upstream.data : [upstream.data];
      upstreamTransId = upstream.trans_id;
    } else {
      throw new Error("Upstream fulfillment failed");
    }
  }

  const [order] = await prisma.$transaction([
    prisma.order.create({
      data: {
        userId,
        productId,
        quantity,
        charge,
        status: credentials.length > 0 ? "COMPLETED" : "PENDING",
        credentials,
        upstreamTransId,
        notes: paymentReference ? `Payment reference: ${paymentReference}` : undefined,
      },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { stockCount: { decrement: quantity } },
    }),
  ]);

  return { order, credentials, product };
}

export async function finalizeGuestOrderPayment({
  reference,
  paidAmount,
  metadata,
}: {
  reference: string;
  paidAmount: number;
  metadata?: Record<string, unknown>;
}) {
  const tx = await prisma.transaction.findUnique({ where: { reference } });
  if (!tx) throw new Error("Transaction not found");
  if (tx.method !== "paystack_guest_order") throw new Error("Invalid transaction type");

  const existingOrder = await prisma.order.findFirst({
    where: { notes: { contains: reference } },
    include: { product: { include: { category: true } } },
  });

  if (tx.status === "COMPLETED") {
    return { order: existingOrder, alreadyCompleted: true };
  }

  if (paidAmount !== Math.round(tx.amount * 100)) {
    await prisma.transaction.update({
      where: { reference },
      data: { status: "FAILED" },
    });
    throw new Error("Amount mismatch");
  }

  const productId = typeof metadata?.productId === "string" ? metadata.productId : "";
  const quantityValue = Number(metadata?.quantity ?? 1);
  const quantity = Number.isFinite(quantityValue) ? quantityValue : 1;

  if (!productId) throw new Error("Missing product");

  const result = await fulfillPaidOrder({
    userId: tx.userId,
    productId,
    quantity,
    charge: tx.amount,
    paymentReference: reference,
  });

  await prisma.transaction.update({
    where: { reference },
    data: { status: "COMPLETED" },
  });

  return { ...result, alreadyCompleted: false };
}
