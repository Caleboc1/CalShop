"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatNGN } from "@/lib/utils";
import toast from "react-hot-toast";
import { ShoppingBag, Package, Shield, RefreshCw, ArrowLeft, Minus, Plus, Copy } from "lucide-react";
import { DashboardMobileNav } from "@/components/dashboard/DashboardMobileNav";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { status } = useSession();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestCredentials, setGuestCredentials] = useState<string[]>([]);
  const [verifyingGuestPayment, setVerifyingGuestPayment] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`).then(r => r.json()).then(setProduct);
    fetch("/api/user").then(r => r.json()).then(d => setBalance(d?.balance ?? null)).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (product) setQuantity(1);
  }, [product]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("guest_ref");
    if (!reference) return;

    setVerifyingGuestPayment(true);
    fetch("/api/checkout/guest/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then(r => r.json().then(d => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => {
        if (!ok) {
          toast.error(data.error || "Payment verification failed");
          return;
        }
        setGuestCredentials(data.credentials || []);
        toast.success("Purchase successful. Your credentials are ready.");
      })
      .catch(() => toast.error("Payment verification failed"))
      .finally(() => {
        setVerifyingGuestPayment(false);
        window.history.replaceState({}, "", `/shop/${id}`);
      });
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

  async function handleGuestBuy() {
    if (!guestEmail.trim()) {
      toast.error("Enter your email to receive purchase support");
      return;
    }

    setBuying(true);
    try {
      const res = await fetch("/api/checkout/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity, email: guestEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Payment failed to start");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBuying(false);
    }
  }

  async function copyGuestCredentials() {
    await navigator.clipboard.writeText(guestCredentials.join("\n"));
    toast.success("Credentials copied");
  }

  if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  const total = product.price * quantity;
  const canAfford = balance !== null && balance >= total;
  const isAuthenticated = status === "authenticated";
  const isGuest = status === "unauthenticated";
  const isCheckingSession = status === "loading";

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link href="/shop" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to shop
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-8">
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
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit lg:sticky lg:top-24">
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
                <button onClick={() => setQuantity((q: number) => Math.max(1, q - 1))}
                  className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity((q: number) => Math.min(product.stockCount, product.maxOrder || 100, q + 1))}
                  className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Min 1 · Max {product.maxOrder || 100}
              </p>
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

            {verifyingGuestPayment && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700">
                Verifying payment and preparing your order...
              </div>
            )}

            {guestCredentials.length > 0 && (
              <div className="mb-4 rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-700">Your credentials</span>
                  <button onClick={copyGuestCredentials} className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-500">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <div className="bg-gray-950 px-3 py-2 max-h-44 overflow-auto">
                  {guestCredentials.map((credential, i) => (
                    <div key={`${credential}-${i}`} className="font-mono text-sm text-green-400 py-1 border-b border-gray-800 last:border-0">
                      {credential}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isGuest && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Email</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={e => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-500 transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1.5">No account required. Pay once and get credentials here after payment.</p>
              </div>
            )}

            <button onClick={isAuthenticated ? handleBuy : handleGuestBuy} disabled={buying || verifyingGuestPayment || isCheckingSession || product.stockCount === 0}
              className="w-full py-3.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm">
              {buying ? "Processing..." : product.stockCount === 0 ? "Out of Stock" : isCheckingSession ? "Loading..." : isAuthenticated ? "Buy Now" : "Pay with Paystack"}
            </button>

            {isGuest && (
              <p className="text-center text-xs text-gray-400 mt-3">
                Already have an account? <Link href="/login" className="text-green-600 font-semibold">Sign in</Link>
              </p>
            )}
          </div>
        </div>
      </div>
      {status === "authenticated" && <DashboardMobileNav />}
    </div>
  );
}
