import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import { Plus, Pencil, Trash2, X, Tag } from "lucide-react";
import { toast } from "sonner";

type Coupon = { id: string; code: string; description: string | null; discount: number; maxDiscount: number | null; minOrder: number; isPercent: boolean; isActive: boolean; expiresAt: string | null };
const EMPTY = { code: "", description: "", discount: 10, maxDiscount: null as number | null, minOrder: 0, isPercent: true, isActive: true, expiresAt: null as string | null };

function Modal({ title, onClose, onSave, saving, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5">{children}</div>
        <div className="flex gap-2 justify-end p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-2 text-sm bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-300 disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CouponsSection() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(() => {
    setLoading(true);
    adminApi.get("/api/admin/coupons").then(r => setCoupons(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm({ ...EMPTY }); setEditing(null); setModal(true); };
  const openEdit = (c: Coupon) => { setForm({ ...c, expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : null }); setEditing(c.id); setModal(true); };
  const close = () => { setModal(false); setEditing(null); };
  const F = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, discount: Number(form.discount), minOrder: Number(form.minOrder), maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null };
      if (editing) await adminApi.put(`/api/admin/coupons/${editing}`, payload);
      else await adminApi.post("/api/admin/coupons", payload);
      toast.success(editing ? "Coupon updated" : "Coupon created");
      close(); fetch();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const del = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try { await adminApi.delete(`/api/admin/coupons/${id}`); toast.success("Deleted"); fetch(); }
    catch { toast.error("Failed to delete"); }
  };

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Coupons <span className="text-gray-400 font-normal text-base">({coupons.length})</span></h2>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-4 py-2 rounded-xl text-sm">
          <Plus className="h-4 w-4" /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Discount</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Min Order</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Expires</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-yellow-500" />
                      <span className="font-mono font-bold text-gray-900">{c.code}</span>
                    </div>
                    {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900">
                    {c.isPercent ? `${c.discount}%` : `₹${c.discount}`}
                    {c.maxDiscount && <span className="text-xs text-gray-400 ml-1">(max ₹{c.maxDiscount})</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{c.minOrder > 0 ? `₹${c.minOrder}` : "None"}</td>
                  <td className="px-5 py-3 text-gray-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => del(c.id, c.code)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No coupons found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={editing ? "Edit Coupon" : "Add Coupon"} onClose={close} onSave={save} saving={saving}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Code * (uppercase)</label>
              <input value={form.code} onChange={e => F("code", e.target.value.toUpperCase())}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 font-mono tracking-widest" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Description</label>
              <input value={form.description ?? ""} onChange={e => F("description", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={form.isPercent} onChange={() => F("isPercent", true)} />
                Percentage (%)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={!form.isPercent} onChange={() => F("isPercent", false)} />
                Fixed (₹)
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Discount {form.isPercent ? "%" : "₹"} *</label>
                <input type="number" value={form.discount} onChange={e => F("discount", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Max Discount (₹)</label>
                <input type="number" value={form.maxDiscount ?? ""} onChange={e => F("maxDiscount", e.target.value || null)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Min Order (₹)</label>
                <input type="number" value={form.minOrder} onChange={e => F("minOrder", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Expires At</label>
                <input type="datetime-local" value={form.expiresAt ?? ""} onChange={e => F("expiresAt", e.target.value || null)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => F("isActive", e.target.checked)} className="rounded" />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
