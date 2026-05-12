import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useStore, cartTotals } from "@/lib/store";

export function StickyCartBar() {
  const cart = useStore((s) => s.cart);
  const { itemsCount, subtotal } = cartTotals(cart);
  if (itemsCount === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-[80px] inset-x-0 z-30 flex justify-center">
      <Link
        to="/cart"
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 mustard-shadow transition-transform active:scale-95"
      >
        <div className="relative">
          <ShoppingBag className="h-5 w-5 text-secondary-foreground" />
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-extrabold text-primary-foreground">
            {itemsCount > 9 ? "9+" : itemsCount}
          </span>
        </div>
        <span className="text-sm font-extrabold text-secondary-foreground">
          ₹{subtotal}
        </span>
        <span className="text-[11px] text-secondary-foreground/65">View cart</span>
      </Link>
    </div>
  );
}
