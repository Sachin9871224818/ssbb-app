import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type Banner = { id: string; title: string; sub: string | null; cta: string | null; bg: string | null; fg: string | null; sortOrder: number; isActive: boolean };
const EMPTY = { title: "", sub: "", cta: "Shop now", bg: "linear-gradient(135deg,#1a1a1a,#2a2a2a)", fg: "#FFC83D", sortOrder: 0, isActive: true };

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

export function BannersSection() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(() => {
    setLoading(true);
    adminApi.get("/api/admin/banners").then(r => setBanners(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm({ ...EMPTY }); setEditing(null); setModal(true); };
  const openEdit = (b: Banner) => { setForm({ ...b }); setEditing(b.id); setModal(true); };
  const close = () => { setModal(false); setEditing(null); };
  const F = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await adminApi.put(`/api/admin/banners/${editing}`, form);
      else await adminApi.post("/api/admin/banners", form);
      toast.success(editing ? "Banner updated" : "Banner created");
      close(); fetch();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try { await adminApi.delete(`/api/admin/banners/${id}`); toast.success("Deleted"); fetch(); }
    catch { toast.error("Failed to delete"); }
  };

  const toggleActive = async (b: Banner) => {
    try { await adminApi.put(`/api/admin/banners/${b.id}`, { isActive: !b.isActive }); fetch(); }
    catch { toast.error("Failed to update"); }
  };

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Banners <span className="text-gray-400 font-normal text-base">({banners.length})</span></h2>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-4 py-2 rounded-xl text-sm">
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      <div className="space-y-3">
        {banners.map(b => (
          <div key={b.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex ${!b.isActive ? "opacity-60" : "border-gray-100"}`}>
            {/* Preview */}
            <div className="w-36 sm:w-48 flex-shrink-0 p-4 flex flex-col justify-between" style={{ background: b.bg ?? "#1a1a1a", color: b.fg ?? "#FFC83D" }}>
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">Banner</p>
              <div>
                <p className="font-extrabold text-sm leading-tight">{b.title}</p>
                {b.sub && <p className="text-xs opacity-70 mt-0.5">{b.sub}</p>}
                {b.cta && <span className="mt-1.5 inline-block text-xs font-semibold opacity-80">{b.cta} →</span>}
              </div>
            </div>
            {/* Info */}
            <div className="flex-1 p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">{b.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono truncate max-w-xs">{b.bg}</p>
                <span className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${b.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {b.isActive ? "Active" : "Hidden"}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(b)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                  {b.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => del(b.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && <p className="text-gray-400 text-center py-10">No banners found</p>}
      </div>

      {modal && (
        <Modal title={editing ? "Edit Banner" : "Add Banner"} onClose={close} onSave={save} saving={saving}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Title *</label>
              <input value={form.title} onChange={e => F("title", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Subtitle</label>
              <input value={form.sub ?? ""} onChange={e => F("sub", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">CTA Text</label>
              <input value={form.cta ?? ""} onChange={e => F("cta", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Background (CSS color or gradient)</label>
              <input value={form.bg ?? ""} onChange={e => F("bg", e.target.value)} placeholder="linear-gradient(135deg,#000,#333)"
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 font-mono text-xs" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Text Color</label>
              <div className="flex gap-2 mt-1">
                <input type="color" value={form.fg ?? "#FFC83D"} onChange={e => F("fg", e.target.value)}
                  className="h-9 w-14 border border-gray-200 rounded-xl cursor-pointer p-1" />
                <input value={form.fg ?? ""} onChange={e => F("fg", e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 font-mono" />
              </div>
            </div>
            {/* Preview */}
            <div className="rounded-xl p-4" style={{ background: form.bg, color: form.fg }}>
              <p className="font-extrabold">{form.title || "Title"}</p>
              <p className="text-xs opacity-80 mt-0.5">{form.sub || "Subtitle"}</p>
              <span className="mt-1.5 inline-block text-xs font-semibold opacity-80">{form.cta || "CTA"} →</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => F("sortOrder", parseInt(e.target.value))}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isActive} onChange={e => F("isActive", e.target.checked)} className="rounded" />
                  Active
                </label>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
