import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, ShoppingBag, MapPin, Tag, HelpCircle, LogOut, MessageCircle, Phone, Heart, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-api";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My profile — Shri Shyam Bachat Bazaar" }] }),
  component: ProfilePage,
});

const items = [
  { icon: ShoppingBag, label: "My orders", to: "/order", sub: "Track and reorder" },
  { icon: Heart, label: "Wishlist", to: "/", sub: "Saved items" },
  { icon: MapPin, label: "Addresses", to: "/address", sub: "Manage delivery addresses" },
  { icon: Tag, label: "Offers & coupons", to: "/", sub: "Try BACHAT50 · FIRST100 · SAVE20" },
  { icon: Bell, label: "Notifications", to: "/", sub: "Order & offer alerts" },
  { icon: HelpCircle, label: "Help & support", to: "/", sub: "Talk to us" },
];

function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const ordersQuery = useOrders();
  const orders = ordersQuery.data ?? [];

  const totalSaved = orders.reduce((a: number, o: any) => a + Number(o.discount || 0), 0);
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="pb-10">
      <header className="gradient-ink rounded-b-3xl px-5 pb-8 pt-8 text-secondary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-extrabold text-primary-foreground">
            {initials}
          </div>
          <div className="leading-tight">
            <p className="text-lg font-extrabold">
              {user ? `Hello, ${user.name.split(" ")[0]}` : "Hello, Guest"}
            </p>
            <p className="text-xs text-secondary-foreground/70">
              {user?.phone || user?.email || "Sign in for the full experience"}
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Stat n={String(orders.length)} l="Orders" />
          <Stat n={totalSaved > 0 ? `₹${totalSaved}` : "₹0"} l="Saved" />
          <Stat n={user ? "∞" : "0"} l="Addresses" />
        </div>
      </header>

      <div className="px-4">
        {!user && (
          <Link to="/auth" className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-secondary py-3.5 text-sm font-bold text-primary-foreground mustard-shadow">
            Sign in / Create account
          </Link>
        )}

        <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <li key={it.label}>
                <Link to={it.to as any} className="flex items-center gap-3 p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-secondary"><Icon className="h-4 w-4" /></div>
                  <div className="flex-1 leading-tight">
                    <p className="text-sm font-semibold">{it.label}</p>
                    <p className="text-[11px] text-muted-foreground">{it.sub}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href="tel:9871224818" className="flex items-center justify-center gap-2 rounded-2xl bg-card p-3 text-xs font-bold border border-border">
            <Phone className="h-4 w-4 text-secondary" /> Call store
          </a>
          <a href="https://wa.me/919728640896" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-success p-3 text-xs font-bold text-success-foreground">
            <MessageCircle className="h-4 w-4" /> WhatsApp us
          </a>
        </div>

        {user && (
          <button onClick={handleSignOut} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-xs font-bold text-destructive">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        )}

        <div className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
          <p className="font-bold text-foreground">Shri Shyam Bachat Bazaar</p>
          <p>Sasta Bhi, Best Bhi · Rajokri & Mahipalpur, New Delhi</p>
          <p>Founder · Nikku Yadav</p>
          <p className="mt-2 text-[10px] uppercase tracking-widest">Powered by SK Digitaltech</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
      <p className="text-base font-extrabold">{n}</p>
      <p className="text-[10px] uppercase tracking-widest text-secondary-foreground/60">{l}</p>
    </div>
  );
}
