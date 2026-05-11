import { useEffect, useState, useCallback, useRef } from "react";
import { adminApi } from "@/lib/adminApi";
import {
  Plus, Pencil, Trash2, Search, X, Upload,
  ImageIcon, Check, Star, PackageX, ToggleLeft, ToggleRight, Link2,
} from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string; name: string; qty: string; price: number; mrp: number;
  imageUrl: string | null; emoji: string | null; bg: string | null;
  inStock: boolean; isBestseller: boolean; description: string | null;
  categoryId: string | null; category?: { id: string; name: string } | null;
};
type Category = { id: string; name: string };

const EMPTY = {
  name: "", qty: "", price: 0, mrp: 0,
  imageUrl: "", emoji: "🛒", bg: "#F5F5F5",
  inStock: true, isBestseller: false, description: "", categoryId: "",
};

/* ── Image upload / URL picker used inside the modal ──────────────────── */
function ImagePicker({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5 MB"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await adminApi.post("/api/admin/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(data.url);
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-500">Product Image</label>

      {/* Current image preview */}
      {value ? (
        <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img src={value.startsWith("/") ? `http://localhost:8000${value}` : value}
            alt="Product" className="w-full h-full object-contain" />
          <button onClick={() => onChange("")}
            className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <X className="h-3 w-3 text-white" />
          </button>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex border border-gray-200 rounded-xl overflow-hidden text-xs">
        <button
          onClick={() => setTab("upload")}
          className={`flex-1 py-2 font-medium transition-colors ${tab === "upload" ? "bg-yellow-400 text-gray-900" : "text-gray-500 hover:bg-gray-50"}`}>
          Upload file
        </button>
        <button
          onClick={() => setTab("url")}
          className={`flex-1 py-2 font-medium transition-colors ${tab === "url" ? "bg-yellow-400 text-gray-900" : "text-gray-500 hover:bg-gray-50"}`}>
          Paste URL
        </button>
      </div>

      {tab === "upload" ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-5 cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/50 transition-colors"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent" />
          ) : (
            <>
              <Upload className="h-7 w-7 text-gray-300" />
              <p className="text-xs text-gray-400 text-center">
                <span className="text-yellow-500 font-semibold">Click to upload</span> or drag & drop<br />
                JPG, PNG, WebP · Max 5 MB
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="url"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400"
            />
          </div>
          {value && (
            <button onClick={() => onChange("")} className="px-2 text-red-400 hover:text-red-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Product Card ─────────────────────────────────────────────────────── */
function ProductCard({
  product, onEdit, onDelete, onToggleStock,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStock: () => void;
}) {
  const imgSrc = product.imageUrl
    ? (product.imageUrl.startsWith("/") ? `http://localhost:8000${product.imageUrl}` : product.imageUrl)
    : null;
  const discount = product.mrp > 0
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md hover:border-gray-200 transition-all">
      {/* Image area */}
      <div
        className="relative h-40 flex items-center justify-center"
        style={{ background: imgSrc ? "#f9fafb" : (product.bg ?? "#F5F5F5") }}
      >
        {imgSrc ? (
          <img src={imgSrc} alt={product.name}
            className="h-full w-full object-contain p-3" />
        ) : (
          <span className="text-5xl">{product.emoji ?? "📦"}</span>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isBestseller && (
            <span className="flex items-center gap-0.5 bg-yellow-400 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
              <Star className="h-2.5 w-2.5 fill-gray-900" /> Best
            </span>
          )}
          {discount > 0 && (
            <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
              {discount}% off
            </span>
          )}
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg border border-red-100">Out of Stock</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button onClick={onEdit}
            className="flex items-center gap-1 bg-white text-gray-900 font-semibold text-xs px-3 py-1.5 rounded-xl shadow hover:bg-yellow-400 transition-colors">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button onClick={onDelete}
            className="flex items-center gap-1 bg-white text-red-600 font-semibold text-xs px-3 py-1.5 rounded-xl shadow hover:bg-red-50 transition-colors">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{product.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{product.qty}</p>

        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="font-bold text-gray-900 text-sm">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through ml-1">₹{product.mrp}</span>
            )}
          </div>
          <button
            onClick={onToggleStock}
            title={product.inStock ? "Mark out of stock" : "Mark in stock"}
            className={`transition-colors ${product.inStock ? "text-green-500 hover:text-red-400" : "text-gray-300 hover:text-green-500"}`}
          >
            {product.inStock
              ? <ToggleRight className="h-6 w-6" />
              : <ToggleLeft className="h-6 w-6" />}
          </button>
        </div>

        {product.category && (
          <p className="text-[11px] text-gray-400 mt-1.5 truncate">{product.category.name}</p>
        )}
      </div>
    </div>
  );
}

/* ── Modal ────────────────────────────────────────────────────────────── */
function Modal({ title, onClose, onSave, saving, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">{children}</div>
        <div className="flex gap-2 justify-end px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onSave} disabled={saving}
            className="px-5 py-2 text-sm bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-300 disabled:opacity-60 transition-colors">
            {saving ? "Saving…" : "Save product"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────── */
export function ProductsSection() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [page, setPage]           = useState(1);
  const [modal, setModal]         = useState<"create" | "edit" | null>(null);
  const [form, setForm]           = useState<any>({ ...EMPTY });
  const [editing, setEditing]     = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const PAGE = 24;

  const loadProducts = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), limit: String(PAGE) });
    if (search)    p.set("search", search);
    if (catFilter) p.set("category", catFilter);
    adminApi.get(`/api/admin/products?${p}`)
      .then(r => { setProducts(r.data.data); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, catFilter, page]);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { setPage(1); }, [search, catFilter]);
  useEffect(() => {
    adminApi.get("/api/admin/categories").then(r => setCategories(r.data.data)).catch(console.error);
  }, []);

  const openCreate = () => { setForm({ ...EMPTY }); setEditing(null); setModal("create"); };
  const openEdit   = (p: Product) => {
    setForm({
      name: p.name, qty: p.qty, price: p.price, mrp: p.mrp,
      imageUrl: p.imageUrl ?? "", emoji: p.emoji ?? "📦", bg: p.bg ?? "#F5F5F5",
      inStock: p.inStock, isBestseller: p.isBestseller,
      description: p.description ?? "", categoryId: p.categoryId ?? "",
    });
    setEditing(p.id);
    setModal("edit");
  };
  const closeModal = () => { setModal(null); setEditing(null); };
  const F = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

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
        imageUrl: form.imageUrl || null,
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
      loadProducts();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await adminApi.delete(`/api/admin/products/${id}`); toast.success("Deleted"); loadProducts(); }
    catch { toast.error("Failed to delete"); }
  };

  const toggleStock = async (p: Product) => {
    try {
      await adminApi.put(`/api/admin/products/${p.id}`, { inStock: !p.inStock });
      toast.success(p.inStock ? "Marked out of stock" : "Marked in stock");
      loadProducts();
    } catch { toast.error("Failed to update"); }
  };

  const pages = Math.ceil(total / PAGE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Products <span className="text-gray-400 font-normal text-base">({total})</span>
        </h2>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
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

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <PackageX className="h-10 w-10 mb-2 opacity-30" />
          <p>No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onEdit={() => openEdit(p)}
              onDelete={() => del(p.id, p.name)}
              onToggleStock={() => toggleStock(p)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
          <span>Page {page} of {pages} · {total} products</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {modal && (
        <Modal
          title={modal === "create" ? "Add New Product" : "Edit Product"}
          onClose={closeModal}
          onSave={save}
          saving={saving}
        >
          {/* Image picker */}
          <ImagePicker value={form.imageUrl} onChange={v => F("imageUrl", v)} />

          {/* Fallback emoji+bg (shown only if no image) */}
          {!form.imageUrl && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl">
              <div>
                <label className="text-xs font-medium text-gray-500">Fallback Emoji</label>
                <input value={form.emoji} onChange={e => F("emoji", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-2xl text-center focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Background color</label>
                <div className="flex gap-2 mt-1">
                  <input type="color" value={form.bg || "#F5F5F5"} onChange={e => F("bg", e.target.value)}
                    className="h-9 w-12 border border-gray-200 rounded-xl cursor-pointer p-1" />
                  <input value={form.bg || ""} onChange={e => F("bg", e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-2 py-2 text-xs font-mono focus:outline-none focus:border-yellow-400" />
                </div>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-gray-500">Product Name *</label>
            <input value={form.name} onChange={e => F("name", e.target.value)}
              placeholder="e.g. Tomato (Local)"
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
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
              <label className="text-xs font-medium text-gray-500">Selling Price (₹) *</label>
              <input type="number" min="0" value={form.price} onChange={e => F("price", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            {/* MRP */}
            <div>
              <label className="text-xs font-medium text-gray-500">MRP (₹) *</label>
              <input type="number" min="0" value={form.mrp} onChange={e => F("mrp", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500">Description</label>
            <textarea value={form.description} onChange={e => F("description", e.target.value)} rows={2}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={Boolean(form.inStock)} onChange={e => F("inStock", e.target.checked)}
                className="w-4 h-4 rounded accent-yellow-400" />
              <span className="text-gray-700">In Stock</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={Boolean(form.isBestseller)} onChange={e => F("isBestseller", e.target.checked)}
                className="w-4 h-4 rounded accent-yellow-400" />
              <span className="text-gray-700">⭐ Bestseller</span>
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
