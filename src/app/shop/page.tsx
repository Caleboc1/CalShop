"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatNGN } from "@/lib/utils";
import { Search, ShoppingBag, Package, ChevronRight } from "lucide-react";

export default function ShopPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(r => r.json()),
      fetch("/api/products").then(r => r.json()),
    ]).then(([cats, prods]) => {
      setCategories(cats || []);
      setProducts(prods || []);
      setFiltered(prods || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let res = products;
    if (selectedCat !== "all") res = res.filter((p: any) => p.categoryId === selectedCat);
    if (search) res = res.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(res);
  }, [selectedCat, search, products]);

  const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "AcctMarket";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
            </div>
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">Sign In</Link>
            <Link href="/dashboard" className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-xl transition-colors">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">All Products</h1>
          <p className="text-gray-500 text-sm">{filtered.length} products available</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar categories */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
              <div className="flex flex-col gap-1">
                <button onClick={() => setSelectedCat("all")}
                  className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCat === "all" ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50"}`}>
                  All Products <span className="text-gray-400 text-xs ml-1">({products.length})</span>
                </button>
                {categories.map((c: any) => (
                  <button key={c.id} onClick={() => setSelectedCat(c.id)}
                    className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${selectedCat === c.id ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50"}`}>
                    <span>{c.name}</span>
                    <span className="text-gray-400 text-xs">{c._count?.products || 0}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white" />
            </div>

            {loading ? (
              <div className="py-20 text-center text-gray-400">Loading products...</div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>No products found</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((p: any) => (
                  <Link key={p.id} href={`/shop/${p.id}`}
                    className="bg-white border border-gray-200 hover:border-green-300 hover:shadow-md rounded-2xl p-5 transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-green-600" />
                      </div>
                      {p.stockCount > 0 ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">{p.stockCount} in stock</span>
                      ) : (
                        <span className="text-xs font-semibold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">Out of stock</span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-green-700 transition-colors line-clamp-2">{p.name}</h3>
                    <p className="text-xs text-gray-400 mb-3">{p.category?.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-extrabold text-green-600">{formatNGN(p.price)}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
