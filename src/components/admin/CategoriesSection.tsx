import { useEffect, useState, useCallback, useRef } from "react";
import { adminApi } from "@/lib/adminApi";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: string; slug: string; name: string; emoji: string | null;
  bg: string | null; sortOrder: number; _count?: { products: number };
};
const EMPTY = { slug: "", name: "", emoji: "🛒", bg: "#F5F5F5", sortOrder: 0 };

/* ── Inline image changer on category card ─────────────────────────────── */
function CategoryImageChanger({ cat, onSaved }: { cat: Category; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [newEmoji, setNewEmoji] = useState(cat.emoji ?? "📁");
  const [newBg, setNewBg] = useState(cat.bg ?? "#F5F5F5");
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.put(`/api/admin/categories/${cat.id}`, { emoji: newEmoji, bg: newBg });
      toast.success("Image updated");
      setOpen(false);
      onSaved();
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setNewEmoji(cat.emoji ?? "📁"); setNewBg(cat.bg ?? "#F5F5F5"); setOpen(o => !o); }}
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 hover:ring-2 hover:ring-yellow-400 hover:ring-offset-1 transition-all group relative"
        style={{ background: cat.bg ?? "#F5F5F5" }}
        title="Change image"
      >
        {cat.emoji ?? "📁"}
        <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-gray-900 rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">✎</span>
      </button>

      {open && (
        <div className="absolute left-0 top-16 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-52">
          <p className="text-xs font-semibold text-gray-500 mb-2">Change image</p>
          <div className="mb-2">
            <label className="text-xs text-gray-400">Emoji</label>
            <input value={newEmoji} onChange={e => setNewEmoji(e.target.value)}
              className="mt-0.5 w-full border border-gray-200 rounded-xl px-3 py-1.5 text-2xl text-center focus:outline-none focus:border-yellow-400" />
          </div>
          <div className="mb-3">
            <label className="text-xs text-gray-400">Background color</label>
            <div className="flex gap-2 mt-0.5">
              <input type="color" value={newBg} onChange={e => setNewBg(e.target.value)}
                className="h-8 w-10 border border-gray-200 rounded-lg cursor-pointer p-0.5" />
              <input value={newBg} onChange={e => setNewBg(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-yellow-400" />
            </div>
            <div className="mt-1.5 w-10 h-10 rounded-xl flex items-center justify-center text-2xl mx-auto" style={{ background: newBg }}>
              {newEmoji}
            </div>
          </div>
          <button onClick={save} disabled={saving}
            className="w-full flex items-center justify-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold rounded-xl py-1.5 text-xs disabled:opacity-60">
            <Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save change"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Modal ───────────────────────────────────────────────────────────────── */
function Modal({ title, onClose, onSave, saving, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-3">{children}</div>
        <div className="flex gap-2 justify-end p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={onSave} disabled={saving}
            className="px-5 py-2 text-sm bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-300 disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export function CategoriesSection() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCats = useCallback(() => {
    setLoading(true);
    adminApi.get("/api/admin/categories")
      .then(r => setCats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCats(); }, [fetchCats]);

  const openCreate = () => {
    setForm({ ...EMPTY });
    setEditing(null);
    setModal(true);
  };

  const openEdit = (c: Category) => {
    setForm({
      slug: c.slug,
      name: c.name,
      emoji: c.emoji ?? "📁",
      bg: c.bg ?? "#F5F5F5",
      sortOrder: c.sortOrder,
    });
    setEditing(c.id);
    setModal(true);
  };

  const close = () => { setModal(false); setEditing(null); };
  const F = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.slug.trim()) { toast.error("Slug is required"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        emoji: form.emoji || null,
        bg: form.bg || null,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editing) {
        await adminApi.put(`/api/admin/categories/${editing}`, payload);
        toast.success("Category updated");
      } else {
        await adminApi.post("/api/admin/categories", payload);
        toast.success("Category created");
      }
      close();
      fetchCats();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products will be uncategorized.`)) return;
    try {
      await adminApi.delete(`/api/admin/categories/${id}`);
      toast.success("Deleted");
      fetchCats();
    } catch { toast.error("Failed to delete"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Categories <span className="text-gray-400 font-normal text-base">({cats.length})</span>
        </h2>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            {/* clickable emoji tile with inline changer */}
            <CategoryImageChanger cat={c} onSaved={fetchCats} />

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{c.name}</p>
              <p className="text-xs text-gray-400 font-mono">{c.slug}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c._count?.products ?? 0} products</p>
            </div>

            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button onClick={() => openEdit(c)}
                className="flex items-center gap-1 px-2 py-1 hover:bg-blue-50 rounded-lg text-blue-500 text-xs font-medium">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button onClick={() => del(c.id, c.name)}
                className="flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded-lg text-red-500 text-xs font-medium">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
        {cats.length === 0 && (
          <p className="text-gray-400 col-span-3 text-center py-10">No categories found</p>
        )}
      </div>

      {modal && (
        <Modal title={editing ? "Edit Category" : "Add Category"} onClose={close} onSave={save} saving={saving}>
          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: form.bg || "#F5F5F5" }}>
              {form.emoji || "📁"}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{form.name || "Category Name"}</p>
              <p className="text-xs text-gray-400 font-mono">{form.slug || "slug"}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Name *</label>
            <input value={form.name} onChange={e => F("name", e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
              placeholder="Fresh Vegetables" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Slug * (lowercase, hyphens only)</label>
            <input
              value={form.slug}
              onChange={e => F("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 font-mono"
              placeholder="fresh-vegetables"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Emoji</label>
              <input value={form.emoji} onChange={e => F("emoji", e.target.value)}
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
              <input type="color" value={form.bg || "#F5F5F5"} onChange={e => F("bg", e.target.value)}
                className="h-9 w-12 border border-gray-200 rounded-xl cursor-pointer p-1" />
              <input value={form.bg || ""} onChange={e => F("bg", e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-yellow-400" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
