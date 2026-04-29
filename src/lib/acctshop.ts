const API_URL = process.env.ACCTSHOP_API_URL || "https://www.acctshop.com/api/v2";
const API_KEY = process.env.ACCTSHOP_API_KEY!;

async function get(endpoint: string) {
  const res = await fetch(`${API_URL}/${endpoint}?api_key=${API_KEY}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Acctshop API error: ${res.status}`);
  return res.json();
}

async function post(formData: Record<string, string>) {
  const body = new URLSearchParams({ ...formData, api_key: API_KEY });
  const res = await fetch(`${API_URL}/order`, { method: "POST", body });
  if (!res.ok) throw new Error(`Acctshop order error: ${res.status}`);
  return res.json();
}

export async function getCategories() {
  return get("categories");
}

export async function getProducts(categoryId?: string) {
  const endpoint = categoryId ? `products?category_id=${categoryId}&api_key=${API_KEY}` : `products?api_key=${API_KEY}`;
  const res = await fetch(`${API_URL}/${endpoint}`, { cache: "no-store" });
  return res.json();
}

export async function getProductDetail(productId: string) {
  return get(`products/${productId}`);
}

export async function purchaseProduct(productId: string, quantity: number, coupon?: string) {
  return post({
    action: "buyProduct",
    id: productId,
    amount: String(quantity),
    ...(coupon ? { coupon } : {}),
  });
}

export async function getAccountInfo() {
  return get("account");
}

export async function getOrderDetail(orderId: string) {
  return get(`orders/${orderId}`);
}
