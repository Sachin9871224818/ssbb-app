import { Link } from "@tanstack/react-router";
import { Plus, Minus } from "lucide-react";
import type { Product } from "@/lib/data";
import { useStore } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const cart = useStore((s) => s.cart);
  const add = useStore((s) => s.add);
  const setQty = useStore((s) => s.setQty);
  const item = cart[product.id];
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="flex flex-col rounded-2xl border border-border/60 bg-card p-2.5">
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div
          className="relative flex h-28 items-center justify-center overflow-hidden rounded-xl"
          style={{ background: product.imageUrl ? undefined : (product.bg || "#f5f5f5") }}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <span
            className="text-5xl"
            style={{ display: product.imageUrl ? "none" : "block" }}
          >
            {product.emoji}
          </span>
          {discount > 0 && (
            <span className="absolute left-1.5 top-1.5 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {discount}% OFF
            </span>
          )}
        </div>
      </Link>
      <div className="mt-2 flex flex-1 flex-col">
        <p className="line-clamp-2 text-[13px] font-semibold leading-tight">{product.name}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{product.qty}</p>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] text-muted-foreground line-through">₹{product.mrp}</span>
            <span className="text-sm font-bold">₹{product.price}</span>
          </div>
          {!item ? (
            <button
              onClick={() => add(product)}
              className="rounded-lg border-2 border-primary bg-primary/10 px-3 py-1.5 text-xs font-bold text-secondary transition-all active:scale-95"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-1 py-1 text-secondary-foreground">
              <button onClick={() => setQty(product.id, item.qty - 1)} className="rounded-md p-1 active:bg-white/10">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-4 text-center text-xs font-bold">{item.qty}</span>
              <button onClick={() => add(product)} className="rounded-md p-1 active:bg-white/10">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
