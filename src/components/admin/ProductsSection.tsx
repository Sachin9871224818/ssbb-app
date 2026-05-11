import { useEffect, useState, useCallback, useRef } from "react";
import { adminApi } from "@/lib/adminApi";
import { Plus, Pencil, Trash2, Search, X, PackageX, Check } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string; name: string; qty: string; price: number; mrp: number;
  emoji: string | null; bg: string | null; inStock: boolean; isBestseller: boolean;
  description: string | null; categoryId: string | null;
  category?: { id: string; slug: string; name: string } | null;
};
type Category = { id: string; name: string; slug: string };

const EMPTY = {
  name: "", qty: "", price: 0, mrp: 0, emoji: "🛒", bg: "#F5F5F5",
  inStock: true, isBestseller: false, description: "", categoryId: "",
};

/* ── Inline emoji+color changer ─────────────────────────────────────────── */
function EmojiTile({ productId, emoji, bg, onSaved }: {
  productId: string; emoji: string | null; bg: string | null; onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [newEmoji, setNewEmoji] = useState(emoji ?? "📦");
  const [newBg, setNewBg] = useState(bg ?? "#F5F5F5");
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
      await adminApi.put(`/api/admin/products/${productId}`, { emoji: newEmoji, bg: newBg });
      toast.success("Image updated");
      setOpen(false);
      onSaved();
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      {/* tile */}
      <button
        onClick={() => { setNewEmoji(emoji ?? "📦"); setNewBg(bg ?? "#F5F5F5"); setOpen(o => !o); }}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl hover:ring-2 hover:ring-yellow-400 hover:ring-offset-1 transition-all group relative"
        style={{ background: bg ?? "#F5F5F5" }}
        title="Change image"
      >
        {emoji ?? "📦"}
        <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-gray-900 rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✎</span>
      </button>

      {/* popover */}
      {open && (
        <div className="absolute left-0 top-12 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-56">
          <p className="text-xs font-semibold text-gray-500 mb-2">Change image</p>
          <div className="mb-2">
            <label className="text-xs text-gray-400">Emoji</label>
            <input
              value={newEmoji}
              onChange={e => setNewEmoji(e.target.value)}
              className="mt-0.5 w-full border border-gray-200 rounded-xl px-3 py-1.5 text-2xl text-center focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div className="mb-3">
            <label className="text-xs text-gray-400">Background color</label>
            <div className="flex gap-2 mt-0.5">
              <input
                type="color"
                value={newBg}
                onChange={e => setNewBg(e.target.value)}
                className="h-8 w-10 border border-gray-200 rounded-lg cursor-pointer p-0.5"
              />
              <input
                value={newBg}
                onChange={e => setNewBg(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-yellow-400"
              />
            </div>
            {/* preview */}
            <div className="mt-1.5 w-10 h-10 rounded-xl flex items-center justify-center text-2xl mx-auto" style={{ background: newBg }}>
              {newEmoji}
            </div>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="w-full flex items-center justify-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold rounded-xl py-1.5 text-xs transition-colors disabled:opacity-60"
          >
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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
export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const PAGE = 20;

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE) });
    if (search) params.set("search", search);
    if (catFilter) params.set("category", catFilter);
    adminApi.get(`/api/admin/products?${params}`)
      .then(r => { setProducts(r.data.data); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, catFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [search, catFilter]);
  useEffect(() => {
    adminApi.get("/api/admin/categories")
      .then(r => setCategories(r.data.data))
      .catch(console.error);
  }, []);

  const openCreate = () => {
    setForm({ ...EMPTY });
    setEditing(null);
    setModal("create");
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      qty: p.qty,
      price: p.price,
      mrp: p.mrp,
      emoji: p.emoji ?? "📦",
      bg: p.bg ?? "#F5F5F5",
      inStock: p.inStock,
      isBestseller: p.isBestseller,
      description: p.description ?? "",
      categoryId: p.categoryId ?? "",
    });
    setEditing(p.id);
    setModal("edit");
  };

  const closeModal = () => { setModal(null); setEditing(null); };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    if (!form.qty.trim())  { toast.error("Quantity is required"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        qty: form.qty.trim(),
        price: Number(form.price),
        mrp: Number(form.mrp),
        emoji: form.emoji || null,
        bg: form.bg || null,
        inStock: Boolean(form.inStock),
        isBestseller: Boolean(form.isBestseller),
        description: form.description || null,
        categoryId: form.categoryId || null,
      };
      if (editing) {
        await adminApi.put(`/api/admin/products/${editing}`, payload);
        toast.success("Product updated");
      } else {
        await adminApi.post("/api/admin/products", payload);
        toast.success("Product created");
      }
      closeModal();
      fetchProducts();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || "Failed to save";
      toast.error(String(msg));
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await adminApi.delete(`/api/admin/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch { toast.error("Failed to delete"); }
  };

  const F = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const pages = Math.ceil(total / PAGE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Products <span className="text-gray-400 font-normal text-base">({total})</span>
        </h2>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 bg-white" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-yellow-400">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Price / MRP</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {/* clickable emoji tile */}
                        <EmojiTile
                          productId={p.id}
                          emoji={p.emoji}
                          bg={p.bg}
                          onSaved={fetchProducts}
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.qty}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {p.category?.name ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-bold text-gray-900">₹{p.price}</span>
                      <span className="text-xs text-gray-400 ml-1 line-through">₹{p.mrp}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${p.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-blue-50 rounded-lg text-blue-600 text-xs font-medium transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => del(p.id, p.name)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                      <PackageX className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      {modal && (
        <Modal
          title={modal === "create" ? "Add New Product" : "Edit Product"}
          onClose={closeModal}
          onSave={save}
          saving={saving}
        >
          {/* Preview tile */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl mb-1">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: form.bg || "#F5F5F5" }}>
              {form.emoji || "📦"}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{form.name || "Product Name"}</p>
              <p className="text-xs text-gray-400">{form.qty || "Quantity"}</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-gray-500">Product Name *</label>
            <input value={form.name} onChange={e => F("name", e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
              placeholder="e.g. Tomato (Local)" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Qty */}
            <div>
              <label className="text-xs font-medium text-gray-500">Quantity *</label>
              <input value={form.qty} onChange={e => F("qty", e.target.value)} placeholder="e.g. 1 kg"
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            {/* Category */}
            <div>
              <label className="text-xs font-medium text-gray-500">Category</label>
              <select value={form.categoryId} onChange={e => F("categoryId", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 bg-white">
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {/* Price */}
            <div>
              <label className="text-xs font-medium text-gray-500">Price (₹) *</label>
              <input type="number" min="0" value={form.price} onChange={e => F("price", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            {/* MRP */}
            <div>
              <label className="text-xs font-medium text-gray-500">MRP (₹) *</label>
              <input type="number" min="0" value={form.mrp} onChange={e => F("mrp", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            {/* Emoji */}
            <div>
              <label className="text-xs font-medium text-gray-500">Emoji (icon)</label>
              <input value={form.emoji} onChange={e => F("emoji", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 text-2xl text-center" />
            </div>
            {/* BG */}
            <div>
              <label className="text-xs font-medium text-gray-500">Background color</label>
              <div className="flex gap-2 mt-1">
                <input type="color" value={form.bg || "#F5F5F5"} onChange={e => F("bg", e.target.value)}
                  className="h-9 w-12 border border-gray-200 rounded-xl cursor-pointer p-1" />
                <input value={form.bg || ""} onChange={e => F("bg", e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-yellow-400" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500">Description</label>
            <textarea value={form.description} onChange={e => F("description", e.target.value)} rows={2}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
          </div>

          {/* Toggles */}
          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(form.inStock)}
                onChange={e => F("inStock", e.target.checked)}
                className="w-4 h-4 rounded accent-yellow-400"
              />
              <span className="text-gray-700">In Stock</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(form.isBestseller)}
                onChange={e => F("isBestseller", e.target.checked)}
                className="w-4 h-4 rounded accent-yellow-400"
              />
              <span className="text-gray-700">Bestseller</span>
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
