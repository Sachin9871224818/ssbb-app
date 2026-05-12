import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingCart } from "lucide-react";
import { TopBar } from "@/components/app/TopBar";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Shri Shyam Bachat Bazaar" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const add = useStore((s) => s.add);
  const items = Object.values(wishlist);

  const handleAddToCart = (p: any) => {
    add(p);
    toast.success(`${p.name} added to cart`);
  };

  return (
    <div className="pb-36">
      <TopBar title="Wishlist" />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-4xl">
            🤍
          </div>
          <p className="mt-4 text-base font-bold">Your wishlist is empty</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tap the heart icon on any product to save it here.
          </p>
          <Link
            to="/"
            className="mt-6 rounded-full bg-secondary px-5 py-2.5 text-xs font-bold text-primary mustard-shadow"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="px-4">
          <p className="mb-3 mt-1 text-xs text-muted-foreground">
            {items.length} saved item{items.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-3">
            {items.map((p) => {
              const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                >
                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl text-3xl"
                    style={{ background: p.bg ?? "#f5f5f5" }}
                  >
                    {p.emoji}
                  </Link>
                  <div className="flex-1 leading-tight">
                    <p className="text-[10px] text-muted-foreground">{p.qty}</p>
                    <Link
                      to="/product/$id"
                      params={{ id: p.id }}
                      className="text-sm font-bold"
                    >
                      {p.name}
                    </Link>
                    <div className="mt-0.5 flex items-baseline gap-1.5">
                      <span className="text-sm font-extrabold">₹{p.price}</span>
                      <span className="text-[11px] text-muted-foreground line-through">₹{p.mrp}</span>
                      {discount > 0 && (
                        <span className="text-[10px] font-bold text-success">{discount}% off</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary mustard-shadow"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { toggleWishlist(p); toast.success("Removed from wishlist"); }}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-destructive"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
