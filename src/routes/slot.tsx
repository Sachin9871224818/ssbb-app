import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Clock } from "lucide-react";
import { slots } from "@/lib/data";
import { useStore } from "@/lib/store";
import { TopBar } from "@/components/app/TopBar";

export const Route = createFileRoute("/slot")({
  head: () => ({ meta: [{ title: "Choose delivery slot — Shri Shyam Bachat Bazaar" }] }),
  component: SlotPage,
});

function SlotPage() {
  const selected = useStore((s) => s.selectedSlot);
  const setSlot = useStore((s) => s.setSlot);

  return (
    <div className="pb-4">
      <TopBar title="Delivery slot" />
      <div className="px-4">
        <div className="rounded-3xl bg-secondary p-5 text-secondary-foreground">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Scheduled delivery</p>
          <h1 className="mt-1 text-xl font-extrabold leading-tight">Pick a slot that suits you</h1>
          <p className="mt-1 text-xs text-secondary-foreground/70">No live tracking — your order is delivered within the chosen window. Reliable, every time.</p>
        </div>

        <ul className="mt-5 space-y-3">
          {slots.map((s) => {
            const active = selected === s.id;
            const filling = s.capacity === "Filling fast";
            return (
              <li
                key={s.id}
                onClick={() => setSlot(s.id)}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                  active ? "border-secondary bg-accent/60 ink-shadow" : "border-border bg-card"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mustard-soft text-2xl">{s.icon}</div>
                <div className="flex-1 leading-tight">
                  <p className="text-sm font-bold">{s.label} delivery</p>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="h-3 w-3" /> {s.time}</p>
                  <p className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${filling ? "text-destructive" : "text-success"}`}>
                    • {s.capacity}
                  </p>
                </div>
                {active && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success text-success-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-5 rounded-2xl border border-dashed border-border p-3">
          <p className="text-xs font-bold">Add a delivery note</p>
          <textarea
            placeholder="E.g. Ring the bell twice, leave at door…"
            className="mt-2 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-secondary"
            rows={2}
          />
        </div>
      </div>

      <div className="mx-4 mt-6">
        {selected ? (
          <Link to="/checkout" className="block rounded-2xl bg-secondary py-3.5 text-center text-sm font-bold text-secondary-foreground mustard-shadow">
            Continue to payment →
          </Link>
        ) : (
          <button disabled className="block w-full cursor-not-allowed rounded-2xl bg-muted py-3.5 text-center text-sm font-bold text-muted-foreground">
            Select a slot to continue
          </button>
        )}
        <div className="h-36" />
      </div>
    </div>
  );
}
