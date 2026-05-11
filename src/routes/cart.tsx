import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Minus, Trash2, Tag, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useStore, cartTotals } from "@/lib/store";
import { TopBar } from "@/components/app/TopBar";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart — Shri Shyam Bachat Bazaar" }] }),
  component: CartPage,
});

function CartPage() {
  const cart = useStore((s) => s.cart);
  const add = useStore((s) => s.add);
  const setQty = useStore((s) => s.setQty);
  const remove = useStore((s) => s.remove);
  const t = cartTotals(cart);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const couponDiscount = applied === "BACHAT50" ? Math.min(50, Math.round(t.subtotal * 0.1)) : 0;
  const grandTotal = t.total - couponDiscount;

  if (t.itemsCount === 0) {
    return (
      <div>
        <TopBar title="My cart" />
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-3xl">🛒</div>
          <p className="mt-4 text-base font-bold">Your cart is empty</p>
          <p className="mt-1 text-xs text-muted-foreground">Looks like you haven't added anything yet.</p>
          <Link to="/" className="mt-6 rounded-full bg-secondary px-5 py-2.5 text-xs font-bold text-primary">Start shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <TopBar title={`My cart (${t.itemsCount})`} />

      <div className="px-4">
        <div className="rounded-2xl bg-success/10 p-3 text-xs font-semibold text-success">
          🎉 You're saving ₹{t.savings + couponDiscount} on this order
        </div>

        <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
          {t.items.map(({ product, qty }) => (
            <li key={product.id} className="flex items-center gap-3 p-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl text-3xl" style={{ background: product.bg }}>
                {product.emoji}
              </div>
              <div className="flex-1 leading-tight">
                <p className="text-sm font-semibold">{product.name}</p>
                <p className="text-[11px] text-muted-foreground">{product.qty}</p>
                <p className="mt-1 text-sm font-bold">
                  ₹{product.price * qty}
                  <span className="ml-1 text-[11px] text-muted-foreground line-through">₹{product.mrp * qty}</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-1 py-1 text-secondary-foreground">
                  <button onClick={() => setQty(product.id, qty - 1)} className="rounded-md p-1"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="min-w-4 text-center text-xs font-bold">{qty}</span>
                  <button onClick={() => add(product)} className="rounded-md p-1"><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <button onClick={() => remove(product.id)} className="text-muted-foreground"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </li>
          ))}
        </ul>

        {/* Coupon */}
        <div className="mt-4 rounded-2xl border border-dashed border-secondary bg-accent/40 p-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-secondary" />
            <p className="text-xs font-bold">Apply coupon</p>
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="Try BACHAT50"
              className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-xs uppercase outline-none focus:border-secondary"
            />
            <button
              onClick={() => {
                if (coupon === "BACHAT50") { setApplied(coupon); toast.success("Coupon applied"); }
                else { toast.error("Invalid coupon"); }
              }}
              className="rounded-xl bg-secondary px-4 text-xs font-bold text-primary"
            >Apply</button>
          </div>
          {applied && <p className="mt-2 text-[11px] font-semibold text-success">{applied} applied — you saved ₹{couponDiscount}</p>}
        </div>

        {/* Bill summary */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bill summary</p>
          <Row k="Item total" v={`₹${t.subtotal}`} />
          <Row k="Discount on MRP" v={`-₹${t.savings}`} positive />
          {couponDiscount > 0 && <Row k="Coupon discount" v={`-₹${couponDiscount}`} positive />}
          <Row k="GST (5%)" v={`₹${t.gst}`} />
          <Row k="Delivery charge" v={t.delivery === 0 ? "FREE" : `₹${t.delivery}`} positive={t.delivery === 0} />
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="text-sm font-bold">Total to pay</span>
            <span className="text-base font-extrabold">₹{grandTotal}</span>
          </div>
        </div>
      </div>

      <div className="sticky bottom-24 z-10 mx-4 mt-5 flex items-center justify-between gap-3 rounded-2xl bg-secondary p-3 text-secondary-foreground mustard-shadow">
        <div className="leading-tight">
          <p className="text-[11px] uppercase tracking-wide text-secondary-foreground/60">{t.itemsCount} item{t.itemsCount > 1 ? "s" : ""}</p>
          <p className="text-lg font-extrabold">₹{grandTotal}</p>
        </div>
        <Link to="/address" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground active:scale-95">
          <ShoppingBag className="h-4 w-4" /> Proceed
        </Link>
      </div>
    </div>
  );
}

function Row({ k, v, positive }: { k: string; v: string; positive?: boolean }) {
  return (
    <div className="mt-2 flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className={`text-xs font-semibold ${positive ? "text-success" : ""}`}>{v}</span>
    </div>
  );
}
