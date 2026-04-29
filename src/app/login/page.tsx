"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ShoppingBag, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { toast.error("Invalid email or password"); return; }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] bg-green-100 rounded-full opacity-50 blur-2xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-[220px] h-[220px] bg-emerald-100 rounded-full opacity-50 blur-2xl pointer-events-none" />
      <div className="relative w-full max-w-md z-10">
        <div className="absolute -top-4 -left-2 bg-white border border-green-100 rounded-xl px-3 py-1.5 text-xs font-semibold text-green-700 flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Secure Login
        </div>
        <div className="text-center mb-8">
          <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Welcome back</p>
          <h1 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h1>
        </div>
        <div className="bg-white rounded-2xl p-8 border border-green-100 shadow-xl shadow-green-100/50">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">{process.env.NEXT_PUBLIC_APP_NAME || "AcctMarket"}</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10 transition-all"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full px-4 py-3 pr-12 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10 transition-all"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] text-sm">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            New here?{" "}
            <Link href="/register" className="text-green-600 font-bold hover:text-green-500">Create a free account</Link>
          </p>
        </div>
        <div className="flex items-center justify-center gap-6 mt-5">
          {["SSL Secured", "NGN Payments", "Instant delivery"].map(t => (
            <div key={t} className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />{t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
