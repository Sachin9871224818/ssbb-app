import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, ShoppingBag, User, LayoutGrid } from "lucide-react";
import { useStore } from "@/lib/store";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/categories", label: "Categories", icon: LayoutGrid },
  { to: "/search", label: "Search", icon: Search },
  { to: "/cart", label: "Cart", icon: ShoppingBag },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const count = useStore((s) => Object.values(s.cart).reduce((a, c) => a + c.qty, 0));

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3">
      <nav className="pointer-events-auto flex w-full max-w-[460px] items-center justify-between rounded-3xl border border-border/60 bg-secondary px-1.5 py-2 text-secondary-foreground ink-shadow">
        {items.map((it) => {
          const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[10px] font-medium transition-all ${
                active ? "bg-primary text-primary-foreground" : "text-secondary-foreground/65"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" strokeWidth={2.2} />
                {it.label === "Cart" && count > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </div>
              {it.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
