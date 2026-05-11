import { createFileRoute, Link } from "@tanstack/react-router";
import { Share2, Heart, Plus, Minus, Truck, ShieldCheck, Clock, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { TopBar } from "@/components/app/TopBar";
import { ProductCard } from "@/components/app/ProductCard";
import { toast } from "sonner";
import { useProduct, useProducts } from "@/hooks/use-api";

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Product — Shri Shyam Bachat Bazaar` },
      { name: "description", content: `Shop products on Shri Shyam Bachat Bazaar — ID: ${params.id}` },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const query = useProduct(id);
  const product = query.data;

  const cart = useStore((s) => s.cart);
  const add = useStore((s) => s.add);
  const setQty = useStore((s) => s.setQty);

  const categorySlug = product?.category?.slug ?? product?.categoryId ?? "";
  const relatedQuery = useProducts(categorySlug ? { category: categorySlug } : undefined);
  const related = (relatedQuery.data ?? []).filter((p) => p.id !== id).slice(0, 6);

  if (query.isLoading) {
    return (
      <div>
        <TopBar title="Product" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <p className="text-sm">Product not found</p>
        <Link to="/" className="mt-4 rounded-full bg-secondary px-5 py-2 text-xs font-bold text-primary">Back home</Link>
      </div>
    );
  }

  const item = cart[product.id];
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const cartProduct = {
    id: product.id, name: product.name, qty: product.qty,
    price: product.price, mrp: product.mrp,
    emoji: product.emoji ?? "🛒", bg: product.bg ?? "#f5f5f5",
    category: product.category?.slug ?? "",
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try { await (navigator as any).share({ title: product.name, text: `${product.name} at ₹${product.price}`, url: location.href }); } catch {}
    } else {
      toast.success("Link copied");
    }
  };

  return (
    <div>
      <TopBar
        right={
          <div className="flex gap-2">
            <button onClick={share} className="flex h-10 w-10 items-center justify-center rounded-full bg-card ink-shadow"><Share2 className="h-4 w-4" /></button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card ink-shadow"><Heart className="h-4 w-4" /></button>
          </div>
        }
      />
      <div className="px-4">
        <div className="relative flex h-72 items-center justify-center rounded-3xl" style={{ background: product.bg ?? "#f5f5f5" }}>
          <span className="text-[140px]">{product.emoji ?? "🛒"}</span>
          {discount > 0 && (
            <span className="absolute left-4 top-4 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">{discount}% OFF</span>
          )}
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{product.qty}</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight">{product.name}</h1>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold">₹{product.price}</span>
            <span className="text-sm text-muted-foreground line-through">₹{product.mrp}</span>
            {discount > 0 && <span className="text-xs font-bold text-success">Save ₹{product.mrp - product.price}</span>}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Inclusive of all taxes</p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Pill icon={<Clock className="h-4 w-4" />} label="Scheduled slots" />
          <Pill icon={<Truck className="h-4 w-4" />} label="Free 299+" />
          <Pill icon={<ShieldCheck className="h-4 w-4" />} label="100% fresh" />
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-bold">About this product</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {product.description || "Hand-picked, freshly stocked at our Rajokri & Mahipalpur stores. Choose your delivery slot at checkout — morning, afternoon, evening or night."}
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-bold">Product details</h2>
          <dl className="mt-2 divide-y divide-border rounded-2xl border border-border bg-card text-sm">
            <Row k="Category" v={product.category?.name ?? product.category?.slug ?? "General"} />
            <Row k="Quantity" v={product.qty} />
            <Row k="Brand" v="Shri Shyam Bachat Bazaar" />
            <Row k="Country of origin" v="India" />
          </dl>
        </section>

        {related.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-bold">You may also like</h2>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      <div className="sticky bottom-24 z-10 mx-4 mb-4 mt-6 flex items-center justify-between gap-3 rounded-2xl bg-secondary p-3 text-secondary-foreground mustard-shadow">
        <div className="leading-tight">
          <p className="text-[11px] uppercase tracking-wide text-secondary-foreground/60">Total</p>
          <p className="text-lg font-extrabold">₹{(item?.qty ?? 1) * product.price}</p>
        </div>
        {!item ? (
          <button onClick={() => add(cartProduct)} className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-transform active:scale-95">
            Add to cart
          </button>
        ) : (
          <div className="flex flex-1 items-center justify-between rounded-xl bg-primary px-3 py-2.5 text-primary-foreground">
            <button onClick={() => setQty(product.id, item.qty - 1)} className="rounded-md p-1.5"><Minus className="h-4 w-4" /></button>
            <span className="text-sm font-bold">{item.qty} in cart</span>
            <button onClick={() => add(cartProduct)} className="rounded-md p-1.5"><Plus className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-3 text-center">
      <span className="text-secondary">{icon}</span>
      <span className="text-[10px] font-semibold leading-tight">{label}</span>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="text-xs font-semibold capitalize">{v}</dd>
    </div>
  );
}
