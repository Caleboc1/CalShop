"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatNGN } from "@/lib/utils";
import toast from "react-hot-toast";
import { ShoppingBag, Package, Shield, RefreshCw, ArrowLeft, Minus, Plus } from "lucide-react";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`).then(r => r.json()).then(setProduct);
    fetch("/api/user").then(r => r.json()).then(d => setBalance(d?.balance ?? null)).catch(() => {});
  }, [id]);

  async function handleBuy() {
    setBuying(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) { toast.error("Please sign in to purchase"); router.push("/login"); return; }
        if (res.status === 402) { toast.error("Insufficient balance — please fund your wallet"); router.push("/dashboard/wallet"); return; }
        toast.error(data.error || "Purchase failed"); return;
      }
      toast.success("Purchase successful! Check your orders for credentials.");
      router.push("/dashboard/orders");
    } catch { toast.error("Something went wrong"); }
    finally { setBuying(false); }
  }

  if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  const total = product.price * quantity;
  const canAfford = balance !== null && balance >= total;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link href="/shop" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to shop
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product info */}
          <div>
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">{product.category?.name}</span>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-3 mb-4">{product.name}</h1>
            {product.description && (
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.description}</p>
            )}
            <div className="flex flex-col gap-3">
              {[
                { icon: Shield, text: "24-hour replacement guarantee on faulty accounts" },
                { icon: RefreshCw, text: "Instant delivery to your dashboard after purchase" },
                { icon: ShoppingBag, text: "NGN payment — no forex, no conversion needed" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3 text-sm text-gray-600">
                  <Icon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Purchase card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit sticky top-24">
            <div className="text-3xl font-extrabold text-green-600 mb-1">{formatNGN(product.price)}</div>
            <p className="text-sm text-gray-400 mb-5">per account</p>

            {product.stockCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full mb-5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                {product.stockCount} accounts in stock
              </span>
            ) : (
              <span className="inline-flex text-xs font-semibold text-red-500 bg-red-100 px-3 py-1 rounded-full mb-5">Out of stock</span>
            )}

            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stockCount, product.maxOrder || 100, q + 1))}
                  className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-5 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-xl font-extrabold text-gray-900">{formatNGN(total)}</span>
            </div>

            {balance !== null && !canAfford && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700">
                Insufficient balance. Your balance: {formatNGN(balance)}.{" "}
                <Link href="/dashboard/wallet" className="font-bold underline">Fund wallet →</Link>
              </div>
            )}

            <button onClick={handleBuy} disabled={buying || product.stockCount === 0}
              className="w-full py-3.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm">
              {buying ? "Processing..." : product.stockCount === 0 ? "Out of Stock" : "Buy Now"}
            </button>

            {balance === null && (
              <p className="text-center text-xs text-gray-400 mt-3">
                <Link href="/login" className="text-green-600 font-semibold">Sign in</Link> to purchase
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
