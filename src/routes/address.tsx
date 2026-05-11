import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Plus, Locate, Home, Briefcase, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { TopBar } from "@/components/app/TopBar";
import { toast } from "sonner";

export const Route = createFileRoute("/address")({
  head: () => ({ meta: [{ title: "Delivery address — Shri Shyam Bachat Bazaar" }] }),
  component: AddressPage,
});

function AddressPage() {
  const addresses = useStore((s) => s.addresses);
  const selectedId = useStore((s) => s.selectedAddressId);
  const select = useStore((s) => s.selectAddress);
  const addAddress = useStore((s) => s.addAddress);
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "Home", line1: "", line2: "", city: "New Delhi", pincode: "" });

  return (
    <div>
      <TopBar title="Select address" />
      <div className="px-4">
        {/* Map placeholder */}
        <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-3xl bg-accent">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, rgba(0,0,0,0.06) 1px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(0,0,0,0.06) 1px, transparent 1px)",
              backgroundSize: "40px 40px, 60px 60px",
            }}
          />
          <div className="absolute inset-0">
            <div className="absolute left-[10%] top-[40%] h-1 w-[80%] -rotate-3 rounded-full bg-secondary/15" />
            <div className="absolute left-[15%] top-[65%] h-1 w-[60%] rotate-2 rounded-full bg-secondary/15" />
          </div>
          <div className="relative flex flex-col items-center">
            <MapPin className="h-10 w-10 text-secondary" strokeWidth={2.5} />
            <span className="mt-1 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-primary">Rajokri, New Delhi</span>
          </div>
        </div>

        <button className="mt-3 flex w-full items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold">
          <Locate className="h-4 w-4 text-secondary" /> Use current location
        </button>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Saved addresses</p>
          <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1 text-xs font-bold text-secondary">
            <Plus className="h-3.5 w-3.5" /> Add new
          </button>
        </div>

        <ul className="mt-2 space-y-2">
          {addresses.map((a) => {
            const active = a.id === selectedId;
            const Icon = a.label.toLowerCase() === "work" ? Briefcase : Home;
            return (
              <li
                key={a.id}
                onClick={() => select(a.id)}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-all ${
                  active ? "border-secondary bg-accent/60" : "border-border bg-card"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 leading-tight">
                  <p className="text-sm font-semibold">{a.label}</p>
                  <p className="text-[11px] text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.pincode}</p>
                </div>
                {active && <Check className="h-5 w-5 text-success" />}
              </li>
            );
          })}
        </ul>

        {showForm && (
          <div className="mt-4 space-y-2 rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New address</p>
            <div className="grid grid-cols-2 gap-2">
              {(["Home", "Work", "Other"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setForm({ ...form, label: l })}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                    form.label === l ? "border-secondary bg-secondary text-primary" : "border-border"
                  }`}
                >{l}</button>
              )).slice(0, 3)}
            </div>
            <Input placeholder="House / Flat / Building" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} />
            <Input placeholder="Area / Landmark" value={form.line2} onChange={(v) => setForm({ ...form, line2: v })} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
              <Input placeholder="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
            </div>
            <button
              onClick={() => {
                if (!form.line1 || !form.pincode) { toast.error("Please fill required fields"); return; }
                addAddress({ id: `a${Date.now()}`, ...form });
                setShowForm(false);
                toast.success("Address saved");
              }}
              className="w-full rounded-xl bg-secondary py-3 text-sm font-bold text-primary"
            >Save address</button>
          </div>
        )}
      </div>

      <div className="sticky bottom-24 mx-4 mt-6 flex gap-3">
        <Link to="/slot" className="flex-1 rounded-2xl bg-secondary py-3.5 text-center text-sm font-bold text-primary-foreground mustard-shadow">
          Continue to delivery slot →
        </Link>
      </div>
    </div>
  );
}

function Input(props: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      placeholder={props.placeholder}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-secondary"
    />
  );
}
