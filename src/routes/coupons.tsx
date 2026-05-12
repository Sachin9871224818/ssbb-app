import { createFileRoute, Link } from "@tanstack/react-router";
import { Tag, Copy, Check, ShoppingBag } from "lucide-react";
import { TopBar } from "@/components/app/TopBar";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/coupons")({
  head: () => ({ meta: [{ title: "Offers & Coupons — Shri Shyam Bachat Bazaar" }] }),
  component: CouponsPage,
});

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount: number;
  maxDiscount: number | null;
  minOrder: number;
  isPercent: boolean;
  expiresAt: string | null;
};

function useCoupons() {
  return useQuery<Coupon[]>({
    queryKey: ["coupons"],
    queryFn: () => api.get("/api/coupons").then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  });
}

const BG_COLORS = [
  "from-yellow-400/20 to-yellow-100/40 border-yellow-300",
  "from-green-400/20 to-green-100/40 border-green-300",
  "from-purple-400/20 to-purple-100/40 border-purple-300",
  "from-blue-400/20 to-blue-100/40 border-blue-300",
  "from-orange-400/20 to-orange-100/40 border-orange-300",
];

function CouponsPage() {
  const { data: coupons, isLoading } = useCoupons();
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    toast.success(`Code "${code}" copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const discountLabel = (c: Coupon) => {
    if (c.isPercent) {
      return c.maxDiscount
        ? `${c.discount}% off (up to ₹${c.maxDiscount})`
        : `${c.discount}% off`;
    }
    return `₹${c.discount} off`;
  };

  return (
    <div className="pb-36">
      <TopBar title="Offers & Coupons" />

      {/* Banner */}
      <div className="mx-4 mt-2 flex items-center gap-3 rounded-2xl bg-secondary p-4 text-secondary-foreground mustard-shadow">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Tag className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-extrabold">Exclusive savings</p>
          <p className="text-[11px] text-secondary-foreground/70">
            Apply any code at checkout to save instantly
          </p>
        </div>
      </div>

      <div className="px-4 mt-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : !coupons || coupons.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No active coupons right now. Check back soon!
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((c, idx) => (
              <div
                key={c.id}
                className={`rounded-2xl border bg-gradient-to-br p-4 ${BG_COLORS[idx % BG_COLORS.length]}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-white/60 px-2.5 py-1 font-mono text-sm font-extrabold tracking-widest text-foreground backdrop-blur">
                        {c.code}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-foreground">
                      {discountLabel(c)}
                    </p>
                    {c.description && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{c.description}</p>
                    )}
                    {c.minOrder > 0 && (
                      <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
                        Min. order ₹{c.minOrder}
                      </p>
                    )}
                    {c.expiresAt && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Expires: {new Date(c.expiresAt).toLocaleDateString("en-IN")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(c.code)}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-white/70 px-3 py-2 text-xs font-bold backdrop-blur transition-all active:scale-95"
                  >
                    {copied === c.code ? (
                      <><Check className="h-3.5 w-3.5 text-success" /> Copied</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /> Copy</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/cart"
          className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-secondary py-3.5 text-sm font-bold text-secondary-foreground mustard-shadow"
        >
          <ShoppingBag className="h-4 w-4" />
          Go to cart & apply
        </Link>
      </div>
    </div>
  );
}
