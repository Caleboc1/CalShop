const SECRET = process.env.PAYSTACK_SECRET_KEY!;
const BASE = "https://api.paystack.co";

export async function initializeTransaction(email: string, amount: number, reference: string, callbackUrl: string) {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, amount: Math.round(amount * 100), reference, callback_url: callbackUrl, currency: "NGN" }),
  });
  return res.json();
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`${BASE}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${SECRET}` },
  });
  return res.json();
}
