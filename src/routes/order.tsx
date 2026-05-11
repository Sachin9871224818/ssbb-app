import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Phone, RefreshCcw, MessageCircle, Package, Truck, Clock, Box, ShoppingBag } from "lucide-react";
import { TopBar } from "@/components/app/TopBar";

export const Route = createFileRoute("/order")({
  head: () => ({ meta: [{ title: "Order status — Shri Shyam Bachat Bazaar" }] }),
  component: OrderPage,
});

const steps = [
  { id: "received", label: "Order received", icon: ShoppingBag, time: "Just now" },
  { id: "confirmed", label: "Order confirmed", icon: Check, time: "2 mins" },
  { id: "packing", label: "Packing your items", icon: Package, time: "Soon" },
  { id: "ready", label: "Ready for dispatch", icon: Box, time: "" },
  { id: "out", label: "Out for delivery", icon: Truck, time: "" },
  { id: "delivered", label: "Delivered", icon: Check, time: "" },
];

function OrderPage() {
  const currentStep = 2; // packing

  return (
    <div className="pb-10">
      <TopBar title="Order status" />
      <div className="px-4">
        <div className="rounded-3xl bg-secondary p-5 text-secondary-foreground ink-shadow">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Order #SSBB29481</p>
          <p className="mt-1 text-xl font-extrabold leading-tight">We're packing your order 📦</p>
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/10 p-3">
            <Clock className="h-4 w-4 text-primary" />
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-wide text-secondary-foreground/60">Delivery slot</p>
              <p className="text-sm font-bold">Evening · 4 PM – 7 PM today</p>
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
                  {(done || active) && s.time && <p className="text-[11px] text-muted-foreground">{s.time}</p>}
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

        <div className="mt-5 rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Delivering to</p>
          <p className="mt-1 text-sm font-semibold">Home — B-12, Rajokri Road</p>
          <p className="text-[11px] text-muted-foreground">Near Metro Pillar 14, New Delhi 110038</p>
        </div>

        <Link to="/" className="mt-6 block rounded-2xl bg-secondary py-3.5 text-center text-sm font-bold text-primary-foreground mustard-shadow">
          Continue shopping
        </Link>

        <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-muted-foreground">Powered by SK Digitaltech</p>
      </div>
    </div>
  );
}
