// lib/acctshop.ts
const API_KEY = process.env.ACCTSHOP_API_KEY!;
const BASE_URL = "https://www.acctshop.com/api";

// Helper for GET requests
async function get(endpoint: string, params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.append("api_key", API_KEY);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Acctshop API error: ${res.status}`);
  const data = await res.json();
  if (data.status !== "success") throw new Error(data.msg || "API request failed");
  return data;
}

// Get categories and products (products.php returns both)
export async function getCategoriesAndProducts() {
  const data = await get("products.php");
  return {
    categories: data.categories,
    products: data.categories.flatMap((cat: any) => cat.products || []),
  };
}

// Get products by category
export async function getProductsByCategory(categoryId: string) {
  const data = await get("products.php");
  const category = data.categories.find((cat: any) => cat.id === categoryId);
  return category?.products || [];
}

// Get product details
export async function getProductDetail(productId: string) {
  const data = await get("product.php", { product: productId });
  return data.product?.[0] || null;
}

// Get account info (profile.php)
export async function getAccountInfo() {
  return get("profile.php");
}

// Get order details
export async function getOrderDetail(orderId: string) {
  return get("order.php", { order: orderId });
}

// Purchase product (POST or GET - using GET as shown in docs)
export async function purchaseProduct(productId: string, quantity: number, coupon?: string) {
  const url = new URL(`${BASE_URL}/buy_product`);
  url.searchParams.append("api_key", API_KEY);
  url.searchParams.append("product", productId);
  url.searchParams.append("amount", String(quantity));
  if (coupon) url.searchParams.append("coupon", coupon);
  
  const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error(`Purchase error: ${res.status}`);
  const data = await res.json();
  if (data.status !== "success") throw new Error(data.msg || "Purchase failed");
  return data;
}