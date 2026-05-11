import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useStore, cartTotals } from "@/lib/store";

export function StickyCartBar() {
  const cart = useStore((s) => s.cart);
  const { itemsCount, subtotal } = cartTotals(cart);
  if (itemsCount === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-30">
      <Link
        to="/cart"
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary mustard-shadow transition-transform active:scale-95"
      >
        <ShoppingBag className="h-6 w-6" />
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground">
          {itemsCount > 9 ? "9+" : itemsCount}
        </span>
      </Link>
      <p className="mt-1 text-center text-[10px] font-bold text-secondary">₹{subtotal}</p>
    </div>
  );
}
