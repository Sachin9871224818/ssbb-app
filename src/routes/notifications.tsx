import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Package, Tag, Truck, ShoppingBag } from "lucide-react";
import { TopBar } from "@/components/app/TopBar";
import { useOrders } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Shri Shyam Bachat Bazaar" }] }),
  component: NotificationsPage,
});

const STATUS_LABEL: Record<string, string> = {
  PENDING: "received and confirmed",
  CONFIRMED: "confirmed",
  PACKED: "packed & ready",
  OUT_FOR_DELIVERY: "out for delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

const STATUS_ICON: Record<string, typeof ShoppingBag> = {
  PENDING: ShoppingBag,
  CONFIRMED: ShoppingBag,
  PACKED: Package,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: Package,
  CANCELLED: ShoppingBag,
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PACKED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATIC_OFFERS = [
  {
    id: "offer1",
    icon: Tag,
    color: "bg-yellow-100 text-yellow-700",
    title: "Use code BACHAT50",
    body: "Get 10% off (up to ₹50) on your next order. No minimum required!",
    time: "Ongoing",
  },
  {
    id: "offer2",
    icon: Tag,
    color: "bg-green-100 text-green-700",
    title: "Free delivery on ₹299+",
    body: "Add a few more items and enjoy free delivery on your order.",
    time: "Always active",
  },
  {
    id: "offer3",
    icon: Tag,
    color: "bg-purple-100 text-purple-700",
    title: "Use code SAVE20",
    body: "Save 20% (up to ₹200) on orders above ₹500.",
    time: "Ongoing",
  },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

function NotificationsPage() {
  const { user } = useAuth();
  const ordersQuery = useOrders();
  const orders = ordersQuery.data ?? [];

  const orderNotifs = orders.slice(0, 5).map((o: any) => {
    const Icon = STATUS_ICON[o.status] ?? ShoppingBag;
    return {
      id: o.id,
      icon: Icon,
      color: STATUS_COLOR[o.status] ?? "bg-muted text-muted-foreground",
      title: `Order #${o.orderNumber}`,
      body: `Your order has been ${STATUS_LABEL[o.status] ?? o.status}.`,
      time: timeAgo(o.createdAt),
      link: `/order?id=${o.id}`,
    };
  });

  const allNotifs = [...orderNotifs];

  return (
    <div className="pb-36">
      <TopBar title="Notifications" />

      {!user ? (
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-4xl">🔔</div>
          <p className="mt-4 text-base font-bold">Sign in to see notifications</p>
          <p className="mt-1 text-xs text-muted-foreground">Order updates and offers will appear here.</p>
          <Link to="/auth" className="mt-6 rounded-full bg-secondary px-5 py-2.5 text-xs font-bold text-primary mustard-shadow">
            Sign in
          </Link>
        </div>
      ) : (
        <div className="px-4 mt-2 space-y-2">
          {/* Order notifications */}
          {allNotifs.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2 mb-1">
                Order updates
              </p>
              {allNotifs.map((n) => {
                const Icon = n.icon;
                const content = (
                  <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${n.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 leading-tight">
                      <p className="text-sm font-bold">{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                    </div>
                    <span className="flex-shrink-0 text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                );
                return n.link ? (
                  <a key={n.id} href={n.link}>{content}</a>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })}
            </>
          )}

          {/* Offers */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4 mb-1">
            Offers & promotions
          </p>
          {STATIC_OFFERS.map((n) => {
            const Icon = n.icon;
            return (
              <div key={n.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${n.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 leading-tight">
                  <p className="text-sm font-bold">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                </div>
                <span className="flex-shrink-0 text-[10px] text-muted-foreground">{n.time}</span>
              </div>
            );
          })}

          {allNotifs.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm font-semibold">No order updates yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Place an order and track it here in real time.</p>
              <Link to="/" className="mt-5 rounded-full bg-secondary px-5 py-2.5 text-xs font-bold text-primary mustard-shadow">
                Shop now
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
