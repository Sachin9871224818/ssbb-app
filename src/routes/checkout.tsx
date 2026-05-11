import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Banknote, Smartphone, CreditCard, Check } from "lucide-react";
import { useStore, cartTotals } from "@/lib/store";
import { slots } from "@/lib/data";
import { TopBar } from "@/components/app/TopBar";
import { motion } from "framer-motion";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Shri Shyam Bachat Bazaar" }] }),
  component: CheckoutPage,
});

const methods = [
  { id: "cod", label: "Cash on delivery", sub: "Pay cash to the rider", icon: Banknote },
  { id: "upi", label: "UPI", sub: "GPay, PhonePe, Paytm", icon: Smartphone },
  { id: "card", label: "Debit / Credit card", sub: "Visa, Rupay, Mastercard", icon: CreditCard },
] as const;

function CheckoutPage() {
  const cart = useStore((s) => s.cart);
  const slotId = useStore((s) => s.selectedSlot);
  const clear = useStore((s) => s.clear);
  const t = cartTotals(cart);
  const slot = slots.find((s) => s.id === slotId);
  const [method, setMethod] = useState<typeof methods[number]["id"]>("cod");
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const placeOrder = () => {
    setPlacing(true);
    setTimeout(() => { setPlacing(false); setDone(true); }, 1100);
    setTimeout(() => { clear(); navigate({ to: "/order" }); }, 2200);
  };

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-6 text-center text-secondary-foreground">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-12 w-12" strokeWidth={3} />
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 text-2xl font-extrabold">Order placed!</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-1 text-sm text-secondary-foreground/70">Sasta Bhi, Best Bhi 🛒</motion.p>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Checkout" />
      <div className="px-4 pb-32">
        {slot && (
          <div className="rounded-2xl bg-secondary p-4 text-secondary-foreground">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Delivery slot</p>
            <p className="mt-0.5 text-sm font-bold">{slot.label} · {slot.time}</p>
          </div>
        )}

        <h2 className="mt-5 text-sm font-bold">Payment method</h2>
        <ul className="mt-2 space-y-2">
          {methods.map((m) => {
            const active = method === m.id;
            const Icon = m.icon;
            return (
              <li key={m.id} onClick={() => setMethod(m.id)}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-all ${
                  active ? "border-secondary bg-accent/60" : "border-border bg-card"
                }`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><Icon className="h-4 w-4" /></div>
                <div className="flex-1 leading-tight">
                  <p className="text-sm font-bold">{m.label}</p>
                  <p className="text-[11px] text-muted-foreground">{m.sub}</p>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 ${active ? "border-secondary bg-secondary" : "border-border"}`}>
                  {active && <Check className="h-4 w-4 text-primary" />}
                </div>
              </li>
            );
          })}
        </ul>

        <h2 className="mt-5 text-sm font-bold">Order summary</h2>
        <div className="mt-2 rounded-2xl border border-border bg-card p-4 text-sm">
          <Row k="Items" v={`${t.itemsCount}`} />
          <Row k="Subtotal" v={`₹${t.subtotal}`} />
          <Row k="GST (5%)" v={`₹${t.gst}`} />
          <Row k="Delivery" v={t.delivery === 0 ? "FREE" : `₹${t.delivery}`} />
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="text-sm font-bold">Total</span>
            <span className="text-base font-extrabold">₹{t.total}</span>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[480px] gap-3 border-t border-border bg-background p-4">
        <button
          onClick={placeOrder}
          disabled={placing || t.itemsCount === 0}
          className="flex-1 rounded-2xl bg-secondary py-3.5 text-sm font-bold text-primary-foreground mustard-shadow disabled:opacity-60"
        >
          {placing ? "Placing order…" : `Place order · ₹${t.total}`}
        </button>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="mt-1.5 flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-xs font-semibold">{v}</span>
    </div>
  );
}
