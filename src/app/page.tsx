import Link from "next/link";
import { ShoppingBag, Shield, Zap, RefreshCw, Star, ArrowRight, Check } from "lucide-react";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "AcctMarket";

const PLATFORMS = [
  { name: "Facebook", emoji: "📘", desc: "Aged accounts, USA profiles, ad accounts" },
  { name: "Instagram", emoji: "📸", desc: "Followers, aged profiles, verified" },
  { name: "TikTok", emoji: "🎵", desc: "Aged accounts with followers" },
  { name: "Twitter/X", emoji: "✖️", desc: "Aged accounts, verified profiles" },
  { name: "Gmail", emoji: "📧", desc: "Bulk accounts, aged, verified" },
  { name: "LinkedIn", emoji: "💼", desc: "Aged profiles, connections" },
  { name: "Snapchat", emoji: "👻", desc: "Fresh and aged accounts" },
  { name: "Discord", emoji: "🎮", desc: "Aged, verified accounts" },
];

const FEATURES = [
  { icon: Zap, title: "Instant Delivery", desc: "Credentials delivered to your account the moment payment clears. No waiting, no delay." },
  { icon: Shield, title: "Replacement Guarantee", desc: "Account not working? Get a free replacement within 24 hours, no questions asked." },
  { icon: RefreshCw, title: "Always In Stock", desc: "We maintain deep inventory across all categories so you never hit an out-of-stock wall." },
  { icon: ShoppingBag, title: "Bulk Orders", desc: "Need hundreds of accounts? Our bulk pricing gets cheaper the more you buy." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:h-16 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-900">{APP_NAME}</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-gray-500">
            <Link href="/shop" className="hover:text-gray-900 transition-colors">Shop</Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors">Sign In</Link>
            <Link href="/register" className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100 rounded-full opacity-40 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-100 rounded-full opacity-40 blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/4" />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider mb-8">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Nigeria&apos;s #1 Digital Accounts Marketplace
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 leading-[1.05] mb-6">
            Buy Verified<br />
            <span className="text-gradient">Social Accounts</span><br />
            Instantly
          </h1>
          <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Aged Facebook accounts, Instagram profiles, Gmail, TikTok and more.
            Pay in NGN, receive credentials instantly, replace if faulty.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link href="/shop" className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/25 text-sm">
              Browse All Products <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/register" className="px-8 py-4 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-2xl transition-all text-sm">
              Create Free Account
            </Link>
          </div>
          {/* Trust pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["24hr replacement", "Instant delivery", "NGN payments", "Bulk discounts", "24/7 support"].map(t => (
              <div key={t} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 font-medium shadow-sm">
                <Check className="w-3 h-3 text-green-500" /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {[
            { num: "50K+", label: "Orders Fulfilled" },
            { num: "12K+", label: "Happy Customers" },
            { num: "200+", label: "Product Types" },
            { num: "99%", label: "Success Rate" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-green-600 mb-1">{s.num}</div>
              <div className="text-sm text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Every Platform Covered</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From Facebook ad accounts to aged Gmail addresses — we stock what marketers, agencies, and resellers need</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PLATFORMS.map(p => (
              <Link href="/shop" key={p.name} className="bg-white border border-gray-200 hover:border-green-300 hover:shadow-md rounded-2xl p-5 transition-all group">
                <span className="text-3xl mb-3 block">{p.emoji}</span>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">{p.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{p.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Why Buy From Us?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all group">
                <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <f.icon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6 bg-green-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to get started?</h2>
          <p className="text-green-100 mb-8 text-lg">Create a free account, fund your wallet with NGN, and start buying instantly.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-700 font-bold rounded-2xl hover:bg-green-50 transition-all text-sm">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
            </div>
            {APP_NAME}
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/shop" className="hover:text-gray-600">Shop</Link>
            <Link href="/login" className="hover:text-gray-600">Sign In</Link>
            <Link href="/register" className="hover:text-gray-600">Register</Link>
          </div>
          <p className="text-xs text-gray-300">© {new Date().getFullYear()} {APP_NAME}</p>
        </div>
      </footer>
    </div>
  );
}
