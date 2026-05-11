import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import { Plus, Pencil, Trash2, Search, X, PackageX } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string; name: string; qty: string; price: number; mrp: number;
  emoji: string | null; bg: string | null; inStock: boolean; isBestseller: boolean;
  description: string | null; categoryId: string | null;
  category?: { id: string; slug: string; name: string } | null;
};
type Category = { id: string; name: string; slug: string };

const EMPTY: Omit<Product, "id"> = {
  name: "", qty: "", price: 0, mrp: 0, emoji: "🛒", bg: "#F5F5F5",
  inStock: true, isBestseller: false, description: null, categoryId: null,
};

function Modal({ title, onClose, onSave, saving, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const PAGE = 20;

  const fetch = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE) });
    if (search) params.set("search", search);
    if (catFilter) params.set("category", catFilter);
    adminApi.get(`/api/admin/products?${params}`)
      .then(r => { setProducts(r.data.data); setTotal(r.data.total); })
      .catch(console.error).finally(() => setLoading(false));
  }, [search, catFilter, page]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [search, catFilter]);
  useEffect(() => {
    adminApi.get("/api/admin/categories").then(r => setCategories(r.data.data)).catch(console.error);
  }, []);

  const openCreate = () => { setForm({ ...EMPTY }); setEditing(null); setModal("create"); };
  const openEdit = (p: Product) => { setForm({ ...p }); setEditing(p.id); setModal("edit"); };
  const closeModal = () => { setModal(null); setEditing(null); };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), mrp: Number(form.mrp), categoryId: form.categoryId || null };
      if (editing) await adminApi.put(`/api/admin/products/${editing}`, payload);
      else await adminApi.post("/api/admin/products", payload);
      toast.success(editing ? "Product updated" : "Product created");
      closeModal(); fetch();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await adminApi.delete(`/api/admin/products/${id}`); toast.success("Deleted"); fetch(); }
    catch { toast.error("Failed to delete"); }
  };

  const F = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const pages = Math.ceil(total / PAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Products <span className="text-gray-400 font-normal text-base">({total})</span></h2>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-4 py-2 rounded-xl text-sm">
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
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: p.bg ?? "#F5F5F5" }}>
                          {p.emoji ?? "📦"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.qty}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{p.category?.name ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-5 py-3">
                      <span className="font-bold text-gray-900">₹{p.price}</span>
                      <span className="text-xs text-gray-400 ml-1 line-through">₹{p.mrp}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${p.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.inStock ? "In Stock" : "Out"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => del(p.id, p.name)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                    <PackageX className="h-8 w-8 mx-auto mb-2 opacity-30" />No products found
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal title={modal === "create" ? "Add Product" : "Edit Product"} onClose={closeModal} onSave={save} saving={saving}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500">Name *</label>
                <input value={form.name} onChange={e => F("name", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Quantity *</label>
                <input value={form.qty} onChange={e => F("qty", e.target.value)} placeholder="e.g. 1 kg"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Category</label>
                <select value={form.categoryId ?? ""} onChange={e => F("categoryId", e.target.value || null)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => F("price", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">MRP (₹) *</label>
                <input type="number" value={form.mrp} onChange={e => F("mrp", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Emoji</label>
                <input value={form.emoji ?? ""} onChange={e => F("emoji", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">BG Color</label>
                <div className="flex gap-2 mt-1">
                  <input type="color" value={form.bg ?? "#F5F5F5"} onChange={e => F("bg", e.target.value)}
                    className="h-9 w-14 border border-gray-200 rounded-xl cursor-pointer p-1" />
                  <input value={form.bg ?? "#F5F5F5"} onChange={e => F("bg", e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500">Description</label>
                <textarea value={form.description ?? ""} onChange={e => F("description", e.target.value)} rows={2}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="inStock" checked={form.inStock} onChange={e => F("inStock", e.target.checked)} className="rounded" />
                <label htmlFor="inStock" className="text-sm text-gray-700">In Stock</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="bestseller" checked={form.isBestseller} onChange={e => F("isBestseller", e.target.checked)} className="rounded" />
                <label htmlFor="bestseller" className="text-sm text-gray-700">Bestseller</label>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
