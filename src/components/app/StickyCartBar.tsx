import { Link } from "@tanstack/react-router";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useStore, cartTotals } from "@/lib/store";

export function StickyCartBar() {
  const cart = useStore((s) => s.cart);
  const { itemsCount, subtotal } = cartTotals(cart);
  if (itemsCount === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center px-4">
      <Link
        to="/cart"
        className="pointer-events-auto flex w-full max-w-[440px] items-center justify-between rounded-2xl bg-secondary px-4 py-3 text-secondary-foreground mustard-shadow transition-transform active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] uppercase tracking-wide text-secondary-foreground/60">{itemsCount} item{itemsCount > 1 ? "s" : ""}</span>
            <span className="text-sm font-semibold">₹{subtotal}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-primary">
          View cart <ArrowRight className="h-4 w-4" />
        </div>
      </Link>
    </div>
  );
}
