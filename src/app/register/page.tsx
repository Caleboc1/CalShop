"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); setLoading(false); return; }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/dashboard");
    } catch { toast.error("Something went wrong"); setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] bg-green-100 rounded-full opacity-50 blur-2xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-[220px] h-[220px] bg-emerald-100 rounded-full opacity-50 blur-2xl pointer-events-none" />
      <div className="relative w-full max-w-md z-10">
        <div className="absolute -top-4 -right-2 bg-white border border-green-100 rounded-xl px-3 py-1.5 text-xs font-semibold text-green-700 flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full" /> Free to start
        </div>
        <div className="text-center mb-8">
          <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Get started</p>
          <h1 className="text-3xl font-extrabold text-gray-900">Create your account</h1>
        </div>
        <div className="bg-white rounded-2xl p-8 border border-green-100 shadow-xl shadow-green-100/50">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">{process.env.NEXT_PUBLIC_APP_NAME || "AcctMarket"}</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "name" as const, label: "Full name", type: "text", placeholder: "John Doe" },
              { key: "email" as const, label: "Email address", type: "email", placeholder: "you@example.com" },
              { key: "password" as const, label: "Password", type: "password", placeholder: "Min. 8 characters" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required
                  className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10 transition-all"
                  placeholder={placeholder} />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all hover:scale-[1.01] text-sm">
              {loading ? "Creating account..." : "Create account — it's free"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Have an account?{" "}
            <Link href="/login" className="text-green-600 font-bold hover:text-green-500">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
