import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Check, Phone, RefreshCcw, MessageCircle, Package, Truck, Clock, Box, ShoppingBag, Loader2 } from "lucide-react";
import { TopBar } from "@/components/app/TopBar";
import { useOrders, useOrder } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";

const Search = z.object({ id: z.string().optional() }).partial();

export const Route = createFileRoute("/order")({
  validateSearch: (s) => Search.parse(s),
  head: () => ({ meta: [{ title: "Order status — Shri Shyam Bachat Bazaar" }] }),
  component: OrderPage,
});

const steps = [
  { id: "PENDING",          label: "Order received",       icon: ShoppingBag },
  { id: "CONFIRMED",        label: "Order confirmed",      icon: Check },
  { id: "PACKED",           label: "Packing your items",   icon: Package },
  { id: "OUT_FOR_DELIVERY", label: "Out for delivery",     icon: Truck },
  { id: "DELIVERED",        label: "Delivered",            icon: Check },
];

const STATUS_INDEX: Record<string, number> = {
  PENDING: 0, CONFIRMED: 1, PACKED: 2, OUT_FOR_DELIVERY: 3, DELIVERED: 4,
};

const SLOT_LABELS: Record<string, string> = {
  morning: "Morning · 7 AM – 10 AM",
  afternoon: "Afternoon · 10 AM – 1 PM",
  evening: "Evening · 4 PM – 7 PM",
  night: "Night · 7 PM – 10 PM",
};

function OrderPage() {
  const { user } = useAuth();
  const { id } = useSearch({ from: "/order" });
  const ordersQuery = useOrders();
  const singleOrderQuery = useOrder(id || "");

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-2xl">🔐</p>
        <p className="text-base font-bold">Sign in to view your orders</p>
        <Link to="/auth" search={{ next: "/order" }} className="mt-4 rounded-full bg-secondary px-6 py-3 text-xs font-bold text-primary-foreground mustard-shadow">
          Sign in
        </Link>
      </div>
    );
  }

  if (id) {
    return <SingleOrder orderId={id} />;
  }

  const orders = ordersQuery.data ?? [];

  if (ordersQuery.isLoading) {
    return (
      <div>
        <TopBar title="My orders" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div>
        <TopBar title="My orders" />
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-3xl">📦</div>
          <p className="mt-4 text-base font-bold">No orders yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Your order history will appear here.</p>
          <Link to="/" className="mt-6 rounded-full bg-secondary px-5 py-2.5 text-xs font-bold text-primary">Start shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <TopBar title="My orders" />
      <div className="px-4 space-y-3 mt-2">
        {orders.map((order: any) => (
          <Link key={order.id} to="/order" search={{ id: order.id }} className="block rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary">#{order.orderNumber}</p>
                <p className="mt-0.5 text-sm font-bold">{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</p>
                <p className="text-[11px] text-muted-foreground">{SLOT_LABELS[order.deliverySlot] ?? order.deliverySlot}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={order.status} />
                <p className="mt-1 text-base font-extrabold">₹{Number(order.total)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SingleOrder({ orderId }: { orderId: string }) {
  const query = useOrder(orderId);
  const order = query.data;

  if (query.isLoading) {
    return (
      <div>
        <TopBar title="Order status" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <TopBar title="Order status" />
        <p className="px-6 py-10 text-center text-sm text-muted-foreground">Order not found.</p>
      </div>
    );
  }

  const currentStep = STATUS_INDEX[order.status] ?? 0;
  const addr = order.addressSnapshot as any;

  return (
    <div className="pb-10">
      <TopBar title="Order status" />
      <div className="px-4">
        <div className="rounded-3xl bg-secondary p-5 text-secondary-foreground ink-shadow">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Order #{order.orderNumber}</p>
          <p className="mt-1 text-xl font-extrabold leading-tight">
            {currentStep < 2 ? "We received your order 🛒" : currentStep < 4 ? "We're packing your order 📦" : "Order delivered! ✅"}
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/10 p-3">
            <Clock className="h-4 w-4 text-primary" />
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-wide text-secondary-foreground/60">Delivery slot</p>
              <p className="text-sm font-bold">{SLOT_LABELS[order.deliverySlot] ?? order.deliverySlot}</p>
            </div>
          </div>
        </div>

        <ol className="mt-6 space-y-0">
          {steps.map((s, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            const Icon = s.icon;
            return (
              <li key={s.id} className="relative flex gap-4 pb-5">
                {i !== steps.length - 1 && (
                  <span className={`absolute left-[18px] top-9 h-full w-0.5 ${done ? "bg-success" : "bg-border"}`} />
                )}
                <div className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                  done ? "bg-success text-success-foreground" : active ? "bg-secondary text-primary animate-pulse" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 pt-1">
                  <p className={`text-sm font-bold ${done || active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-2 grid grid-cols-3 gap-2">
          <a href="tel:9871224818" className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-3">
            <Phone className="h-4 w-4 text-secondary" />
            <span className="text-[10px] font-semibold">Call store</span>
          </a>
          <a href="https://wa.me/919728640896" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-3">
            <MessageCircle className="h-4 w-4 text-success" />
            <span className="text-[10px] font-semibold">WhatsApp</span>
          </a>
          <Link to="/" className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-3">
            <RefreshCcw className="h-4 w-4 text-secondary" />
            <span className="text-[10px] font-semibold">Reorder</span>
          </Link>
        </div>

        {addr && (
          <div className="mt-5 rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Delivering to</p>
            <p className="mt-1 text-sm font-semibold">{addr.label} — {addr.line1}</p>
            {addr.line2 && <p className="text-[11px] text-muted-foreground">{addr.line2}, {addr.city} {addr.pincode}</p>}
          </div>
        )}

        <Link to="/order" className="mt-6 block rounded-2xl bg-secondary py-3.5 text-center text-sm font-bold text-primary-foreground mustard-shadow">
          All orders
        </Link>
        <Link to="/" className="mt-2 block rounded-2xl border border-border bg-card py-3 text-center text-sm font-semibold">
          Continue shopping
        </Link>

        <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-muted-foreground">Powered by SK Digitaltech</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PACKED: "bg-purple-100 text-purple-700",
    OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  const label: Record<string, string> = {
    PENDING: "Pending", CONFIRMED: "Confirmed", PACKED: "Packed",
    OUT_FOR_DELIVERY: "Out for delivery", DELIVERED: "Delivered", CANCELLED: "Cancelled",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${colors[status] ?? "bg-muted text-muted-foreground"}`}>
      {label[status] ?? status}
    </span>
  );
}
