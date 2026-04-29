"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { User } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/user/update", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    setSaving(false);
    if (res.ok) toast.success("Profile updated"); else toast.error("Failed to update");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-extrabold text-gray-900">Settings</h2>
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-green-600" />
          <h3 className="font-bold text-gray-900">Profile</h3>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 transition-colors" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email</label>
            <input value={session?.user?.email || ""} disabled
              className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed" />
          </div>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
