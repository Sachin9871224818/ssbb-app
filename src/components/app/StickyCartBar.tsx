import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useStore, cartTotals } from "@/lib/store";

export function StickyCartBar() {
  const cart = useStore((s) => s.cart);
  const { itemsCount, subtotal } = cartTotals(cart);
  if (itemsCount === 0) return null;

  const items = Object.values(cart).slice(0, 3);

  return (
    <div className="pointer-events-none fixed bottom-[72px] inset-x-0 z-30 flex justify-center px-4">
      <Link
        to="/cart"
        className="pointer-events-auto flex w-full max-w-[460px] items-center gap-3 rounded-2xl bg-secondary px-3 py-2.5 mustard-shadow transition-transform active:scale-[0.98]"
      >
        {/* Product emoji thumbnails */}
        <div className="flex -space-x-2">
          {items.map((i) => (
            <div
              key={i.product.id}
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-secondary bg-primary/20 text-xl"
            >
              {i.product.emoji}
            </div>
          ))}
        </div>

        {/* Text */}
        <div className="flex-1">
          <p className="text-sm font-extrabold text-secondary-foreground">
            {itemsCount} item{itemsCount > 1 ? "s" : ""} · ₹{subtotal}
          </p>
          <p className="text-[10px] text-secondary-foreground/65">Tap to view cart</p>
        </div>

        {/* Arrow */}
        <ChevronRight className="h-5 w-5 text-secondary-foreground" strokeWidth={2.5} />
      </Link>
    </div>
  );
}
