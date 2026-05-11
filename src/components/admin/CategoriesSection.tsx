import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type Category = { id: string; slug: string; name: string; emoji: string | null; bg: string | null; sortOrder: number; _count?: { products: number } };
const EMPTY = { slug: "", name: "", emoji: "🛒", bg: "#F5F5F5", sortOrder: 0 };

function Modal({ title, onClose, onSave, saving, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
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

export function CategoriesSection() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(() => {
    setLoading(true);
    adminApi.get("/api/admin/categories").then(r => setCats(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm({ ...EMPTY }); setEditing(null); setModal(true); };
  const openEdit = (c: Category) => { setForm({ slug: c.slug, name: c.name, emoji: c.emoji ?? "", bg: c.bg ?? "#F5F5F5", sortOrder: c.sortOrder }); setEditing(c.id); setModal(true); };
  const close = () => { setModal(false); setEditing(null); };
  const F = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await adminApi.put(`/api/admin/categories/${editing}`, form);
      else await adminApi.post("/api/admin/categories", form);
      toast.success(editing ? "Category updated" : "Category created");
      close(); fetch();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products will be uncategorized.`)) return;
    try { await adminApi.delete(`/api/admin/categories/${id}`); toast.success("Deleted"); fetch(); }
    catch { toast.error("Failed to delete"); }
  };

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Categories <span className="text-gray-400 font-normal text-base">({cats.length})</span></h2>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-4 py-2 rounded-xl text-sm">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: c.bg ?? "#F5F5F5" }}>
              {c.emoji ?? "📁"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{c.name}</p>
              <p className="text-xs text-gray-400 font-mono">{c.slug}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c._count?.products ?? 0} products</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => del(c.id, c.name)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {cats.length === 0 && <p className="text-gray-400 col-span-3 text-center py-10">No categories found</p>}
      </div>

      {modal && (
        <Modal title={editing ? "Edit Category" : "Add Category"} onClose={close} onSave={save} saving={saving}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Name *</label>
              <input value={form.name} onChange={e => F("name", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Slug * (lowercase, no spaces)</label>
              <input value={form.slug} onChange={e => F("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Emoji</label>
                <input value={form.emoji ?? ""} onChange={e => F("emoji", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 text-center text-2xl" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => F("sortOrder", parseInt(e.target.value))}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Background Color</label>
              <div className="flex gap-2 mt-1">
                <input type="color" value={form.bg ?? "#F5F5F5"} onChange={e => F("bg", e.target.value)}
                  className="h-9 w-14 border border-gray-200 rounded-xl cursor-pointer p-1" />
                <input value={form.bg ?? "#F5F5F5"} onChange={e => F("bg", e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 font-mono" />
              </div>
              {/* Preview */}
              <div className="mt-2 flex items-center gap-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: form.bg ?? "#F5F5F5" }}>
                  {form.emoji}
                </div>
                <span className="text-sm text-gray-500">Preview</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
