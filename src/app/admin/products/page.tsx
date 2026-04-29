"use client";
import { useEffect, useState } from "react";
import { formatNGN } from "@/lib/utils";
import toast from "react-hot-toast";
import { Plus, Trash2, Package } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", categoryId: "", price: "", upstreamId: "", stockCount: "0", description: "", minOrder: "1", maxOrder: "100" });

  async function load() {
    setLoading(true);
    const [prods, cats] = await Promise.all([
      fetch("/api/admin/products").then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
    ]);
    setProducts(prods || []); setCategories(cats || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: parseFloat(form.price), stockCount: parseInt(form.stockCount), minOrder: parseInt(form.minOrder), maxOrder: parseInt(form.maxOrder) }),
    });
    if (res.ok) { toast.success("Product created"); setShowForm(false); load(); }
    else toast.error("Failed to create");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    toast.success("Deleted"); load();
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !current }) });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Products ({products.length})</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-5">New Product</h3>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Product Name", field: "name", type: "text", placeholder: "e.g. Facebook USA Aged Account" },
              { label: "Acctshop Product ID", field: "upstreamId", type: "text", placeholder: "ID from Acctshop" },
              { label: "Your Price (NGN)", field: "price", type: "number", placeholder: "e.g. 4500" },
              { label: "Stock Count", field: "stockCount", type: "number", placeholder: "0" },
              { label: "Min Order", field: "minOrder", type: "number", placeholder: "1" },
              { label: "Max Order", field: "maxOrder", type: "number", placeholder: "100" },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{label}</label>
                <input type={type} value={(form as any)[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-400 transition-colors" required={field !== "upstreamId"} />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Category</label>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-400">
                <option value="">Select category</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-400 resize-none" placeholder="Product description..." />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl">Create Product</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 text-gray-500 text-sm rounded-xl hover:border-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{["Product", "Category", "Price", "Stock", "Upstream ID", "Active", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs font-medium uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : products.map((p: any) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 text-sm max-w-[180px] truncate">{p.name}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.category?.name}</td>
                  <td className="px-4 py-3 text-green-600 font-bold font-mono text-xs">{formatNGN(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.stockCount > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {p.stockCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.upstreamId || "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p.id, p.isActive)}
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${p.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {p.isActive ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
