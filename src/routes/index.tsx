import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Search, Bell, MessageCircle, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/app/ProductCard";
import { SectionHeader } from "@/components/app/SectionHeader";
import { useCategories, useBanners, useOffers, useProducts } from "@/hooks/use-api";
import { categories as fallbackCategories, banners as fallbackBanners, products as fallbackProducts } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shri Shyam Bachat Bazaar — Grocery delivery in Delhi" },
      { name: "description", content: "Sasta Bhi, Best Bhi. Daily essentials, fresh produce and wholesale grocery delivered in scheduled slots across Rajokri & Mahipalpur." },
    ],
  }),
  component: Home,
});

function Home() {
  const categoriesQuery = useCategories();
  const bannersQuery = useBanners();
  const offersQuery = useOffers();
  const essentialsQuery = useProducts({ category: "essentials" });
  const vegQuery = useProducts({ category: "vegetables" });
  const wholesaleQuery = useProducts({ category: "wholesale" });

  const categories = categoriesQuery.data ?? fallbackCategories.map((c) => ({ ...c, id: c.slug }));
  const banners = bannersQuery.data ?? fallbackBanners;
  const offers = offersQuery.data ?? fallbackProducts.filter((p) => p.mrp - p.price >= 30).slice(0, 8);
  const essentials = essentialsQuery.data ?? fallbackProducts.filter((p) => p.category === "essentials");
  const veg = vegQuery.data ?? fallbackProducts.filter((p) => p.category === "vegetables");
  const wholesale = wholesaleQuery.data ?? fallbackProducts.filter((p) => p.category === "wholesale");

  return (
    <div className="flex flex-col">
      <header className="gradient-ink rounded-b-3xl px-4 pb-5 pt-5 text-secondary-foreground">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                Delivering to <ChevronDown className="h-3 w-3" />
              </p>
              <p className="text-sm font-semibold">Rajokri, New Delhi</p>
              <p className="text-[11px] text-secondary-foreground/60">B-12, near Metro Pillar 14</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://wa.me/919728640896" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-success-foreground">
              <MessageCircle className="h-4 w-4" />
            </a>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Link to="/search" className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm text-secondary-foreground/70 backdrop-blur">
          <Search className="h-4 w-4" />
          Search atta, dal, milk, sabzi…
        </Link>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-primary p-3 text-primary-foreground mustard-shadow">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest">Shri Shyam Bachat Bazaar</p>
            <p className="text-lg font-extrabold leading-tight">Sasta Bhi, Best Bhi.</p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-primary">FREE 299+</span>
        </div>
      </header>

      {/* Banners */}
      <div className="-mt-2 flex gap-3 overflow-x-auto px-4 pt-4 no-scrollbar">
        {banners.map((b) => (
          <div key={b.id} className="flex min-w-[78%] snap-start flex-col justify-between rounded-2xl p-4 ink-shadow" style={{ background: b.bg ?? undefined, color: b.fg ?? undefined }}>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">Today's special</p>
              <p className="mt-1 text-lg font-extrabold leading-tight">{b.title}</p>
              <p className="mt-1 text-[12px] opacity-80">{b.sub}</p>
            </div>
            <span className="mt-3 w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold backdrop-blur">{b.cta} →</span>
          </div>
        ))}
      </div>

      {/* Categories */}
      <SectionHeader title="Shop by category" subtitle="Everything your kitchen needs" />
      <div className="grid grid-cols-4 gap-3 px-4">
        {categories.map((c) => (
          <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="flex flex-col items-center gap-1.5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl" style={{ background: c.bg ?? undefined }}>
              {c.emoji}
            </div>
            <span className="text-center text-[10px] font-semibold leading-tight">{c.name}</span>
          </Link>
        ))}
      </div>

      <Section title="Best offers" subtitle="Handpicked deals just for you" items={offers} />
      <Section title="Daily essentials" subtitle="Stock your pantry" items={essentials} />

      <div className="mx-4 mt-6 overflow-hidden rounded-3xl bg-secondary p-5 text-secondary-foreground ink-shadow">
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Wholesale Bazaar</p>
        <p className="mt-1 text-xl font-extrabold leading-tight">Bulk grocery at<br/>shopkeeper prices</p>
        <p className="mt-1 text-xs text-secondary-foreground/70">Min order ₹2,000 · Free delivery in Rajokri & Mahipalpur</p>
        <Link to="/category/$slug" params={{ slug: "wholesale" }} className="mt-3 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
          Shop wholesale →
        </Link>
      </div>

      <Section title="Fresh vegetables" subtitle="Sourced this morning" items={veg} />
      <Section title="Wholesale picks" subtitle="Save more on bulk" items={wholesale} />

      <p className="mt-10 px-4 pb-4 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
        Powered by SK Digitaltech
      </p>
    </div>
  );
}

function Section({ title, subtitle, items }: { title: string; subtitle?: string; items: any[] }) {
  if (!items || items.length === 0) return null;
  return (
    <>
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
        {items.map((p) => (
          <div key={p.id} className="w-[150px] flex-shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </>
  );
}
