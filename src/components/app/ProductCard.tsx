import { Link } from "@tanstack/react-router";
import { Plus, Minus, Clock, Heart } from "lucide-react";
import type { Product } from "@/lib/data";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const cart = useStore((s) => s.cart);
  const add = useStore((s) => s.add);
  const setQty = useStore((s) => s.setQty);
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const item = cart[product.id];
  const isWishlisted = !!wishlist[product.id];
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="flex flex-col overflow-hidden rounded-[18px] border border-border/60 bg-card">
      {/* Image area */}
      <Link to="/product/$id" params={{ id: product.id }} className="relative block">
        <div
          className="relative flex h-[120px] items-center justify-center overflow-hidden"
          style={{ background: (product as any).imageUrl ? "#f8f8f8" : (product.bg || "#f5f5f5") }}
        >
          {(product as any).imageUrl ? (
            <img
              src={(product as any).imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                const t = e.currentTarget;
                t.style.display = "none";
                const fb = t.nextElementSibling as HTMLElement | null;
                if (fb) fb.style.display = "flex";
              }}
            />
          ) : null}
          <span
            className="text-5xl"
            style={{ display: (product as any).imageUrl ? "none" : "flex" }}
          >
            {product.emoji}
          </span>

          {/* Discount badge */}
          {discount > 0 && (
            <span className="absolute left-2 top-2 rounded-md bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-primary">
              {discount}% OFF
            </span>
          )}

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
              toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
            }}
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm"
          >
            <Heart className={`h-3.5 w-3.5 transition-colors ${isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
          </button>

          {/* Delivery badge */}
          <span className="absolute bottom-1.5 left-2 flex items-center gap-0.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
            <Clock className="h-2.5 w-2.5" />
            Scheduled
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-2.5">
        <p className="text-[10px] text-muted-foreground">{product.qty}</p>
        <p className="mt-0.5 line-clamp-2 text-[12px] font-semibold leading-tight">{product.name}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="leading-tight">
            <p className="text-sm font-bold">₹{product.price}</p>
            <p className="text-[10px] text-muted-foreground line-through">₹{product.mrp}</p>
          </div>

          {!item ? (
            <button
              onClick={() => add(product)}
              className="rounded-lg border-2 border-primary bg-primary/10 px-2.5 py-1.5 text-[11px] font-bold text-secondary transition-all active:scale-95"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-lg bg-secondary px-1 py-1 text-secondary-foreground">
              <button onClick={() => setQty(product.id, item.qty - 1)} className="rounded p-0.5 active:bg-white/10">
                <Minus className="h-3 w-3" />
              </button>
              <span className="min-w-[14px] text-center text-[11px] font-bold">{item.qty}</span>
              <button onClick={() => add(product)} className="rounded p-0.5 active:bg-white/10">
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
