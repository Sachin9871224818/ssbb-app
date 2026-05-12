import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Search, Bell, MessageCircle, ChevronDown, ArrowRight, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "@/components/app/ProductCard";
import { SectionHeader } from "@/components/app/SectionHeader";
import {
  CategoryIconSkeleton,
  BannerSkeleton,
  FreqCardSkeleton,
  ProductCarouselSkeleton,
  ProductGridSkeleton,
} from "@/components/app/Skeleton";
import { useCategories, useBanners, useOffers, useProducts, useBestsellers, useProductSearch } from "@/hooks/use-api";
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

const FREQ_GROUPS = [
  { name: "Chips & Namkeen",    img: "/banners/freq-snacks.jpg",     slug: "snacks" },
  { name: "Vegetables & Fruits", img: "/banners/freq-vegetables.jpg", slug: "vegetables" },
  { name: "Dairy & Eggs",        img: "/banners/freq-dairy.jpg",      slug: "dairy" },
  { name: "Dry Fruits & Nuts",   img: "/banners/freq-dryfruits.jpg",  slug: "dryfruits" },
];

const GROCERY_GRID = [
  { label: "Vegetables & Fruits", emoji: "🥬", bg: "#E8F5D6", slug: "vegetables" },
  { label: "Atta, Rice & Dal", emoji: "🌾", bg: "#FFE7BD", slug: "essentials" },
  { label: "Dairy & Eggs", emoji: "🥛", bg: "#F2EAFE", slug: "dairy" },
  { label: "Dry Fruits", emoji: "🥜", bg: "#F1E1C6", slug: "dryfruits" },
  { label: "Snacks & Drinks", emoji: "🍿", bg: "#FFF1C9", slug: "snacks" },
  { label: "Wholesale", emoji: "📦", bg: "#FFD9A8", slug: "wholesale" },
  { label: "Household", emoji: "🧴", bg: "#DCEEFF", slug: "household" },
  { label: "Beauty & Care", emoji: "💄", bg: "#FFD9EC", slug: "beauty" },
];

function Home() {
  const [q, setQ] = useState("");
  const categoriesQuery = useCategories();
  const bannersQuery = useBanners();
  const offersQuery = useOffers();
  const bestsellersQuery = useBestsellers();
  const essentialsQuery = useProducts({ category: "essentials" });
  const vegQuery = useProducts({ category: "vegetables" });
  const wholesaleQuery = useProducts({ category: "wholesale" });
  const searchQuery = useProductSearch(q);

  const categories = categoriesQuery.data ?? (categoriesQuery.isLoading ? null : fallbackCategories.map((c) => ({ ...c, id: c.slug })));
  const banners = bannersQuery.data ?? (bannersQuery.isLoading ? null : fallbackBanners);
  const offers = offersQuery.data ?? (offersQuery.isLoading ? null : fallbackProducts.filter((p) => p.mrp - p.price >= 30).slice(0, 8));
  const bestsellers = bestsellersQuery.data ?? [];
  const essentials = essentialsQuery.data ?? (essentialsQuery.isLoading ? null : fallbackProducts.filter((p) => p.category === "essentials"));
  const veg = vegQuery.data ?? (vegQuery.isLoading ? null : fallbackProducts.filter((p) => p.category === "vegetables"));
  const wholesale = wholesaleQuery.data ?? (wholesaleQuery.isLoading ? null : fallbackProducts.filter((p) => p.category === "wholesale"));

  const seeAllEmojis = [...(offers ?? []), ...(essentials ?? [])].slice(0, 5).map((p) => (p as any).emoji ?? "🛒");
  const searchResults = searchQuery.data ?? [];

  return (
    <div className="flex flex-col pb-36">
      {/* ── 1. Delivery Header ── */}
      <header className="gradient-ink px-4 pb-4 pt-5 text-secondary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                Delivering to <ChevronDown className="h-3 w-3" />
              </p>
              <p className="text-sm font-bold">Rajokri, New Delhi</p>
              <p className="text-[10px] text-secondary-foreground/50">B-12, near Metro Pillar 14</p>
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
      </header>

      {/* ── 2. Search Bar ── */}
      <div className="gradient-ink px-4 pb-4">
        <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
          <Search className="h-4 w-4 flex-shrink-0 text-secondary-foreground/60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search atta, dal, milk, sabzi…"
            className="flex-1 bg-transparent text-sm text-secondary-foreground outline-none placeholder:text-secondary-foreground/60"
          />
          {q && !searchQuery.isFetching && (
            <button onClick={() => setQ("")} className="text-secondary-foreground/60">
              <X className="h-4 w-4" />
            </button>
          )}
          {searchQuery.isFetching && <Loader2 className="h-4 w-4 animate-spin text-secondary-foreground/60" />}
        </div>
      </div>

      {/* ── Search Results (shown when query is active) ── */}
      {q && (
        <div className="px-4">
          <p className="mb-3 text-xs text-muted-foreground">
            {searchQuery.isFetching ? "Searching…" : `${searchResults.length} results for "${q}"`}
          </p>
          {searchQuery.isFetching ? (
            <ProductGridSkeleton count={4} />
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {searchResults.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No products found for "{q}".<br />Try a different keyword.
            </div>
          )}
        </div>
      )}

      {/* ── Homepage content (hidden while searching) ── */}
      {!q && (
        <>
          {/* ── 3. Category Horizontal Scroll ── */}
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 pt-4 no-scrollbar">
            {categories
              ? categories.map((c) => (
                  <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="flex flex-shrink-0 flex-col items-center gap-1.5">
                    <div
                      className="h-[58px] w-[58px] overflow-hidden rounded-2xl transition-transform active:scale-95"
                      style={{ background: (c as any).bg ?? "#f5f5f5" }}
                    >
                      <img
                        src={`/categories/${c.slug}.jpg`}
                        alt={c.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                          (e.currentTarget.parentElement as HTMLElement).style.fontSize = "24px";
                          (e.currentTarget.parentElement as HTMLElement).style.display = "flex";
                          (e.currentTarget.parentElement as HTMLElement).style.alignItems = "center";
                          (e.currentTarget.parentElement as HTMLElement).style.justifyContent = "center";
                          (e.currentTarget.parentElement as HTMLElement).textContent = (c as any).emoji ?? "🛒";
                        }}
                      />
                    </div>
                    <span className="w-14 text-center text-[9px] font-semibold leading-tight">{c.name}</span>
                  </Link>
                ))
              : Array.from({ length: 7 }).map((_, i) => <CategoryIconSkeleton key={i} />)}
          </div>

          {/* ── 4. Banner Carousel ── */}
          <div className="mt-5 flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar snap-x snap-mandatory">
            {[
              { img: "/banners/c-1.png", slug: "vegetables", alt: "Vegetables & Fruits" },
              { img: "/banners/c-2.png", slug: "dairy",      alt: "Dairy & Eggs" },
              { img: "/banners/c-3.png", slug: "snacks",     alt: "Chips & Namkeen" },
            ].map((b) => (
              <Link
                key={b.slug}
                to="/category/$slug"
                params={{ slug: b.slug }}
                className="flex-shrink-0 min-w-[88%] snap-start rounded-[20px] overflow-hidden ink-shadow active:scale-[0.98] transition-transform"
              >
                <img
                  src={b.img}
                  alt={b.alt}
                  className="w-full h-[130px] object-cover object-center"
                  draggable={false}
                />
              </Link>
            ))}
          </div>

          {/* ── 5. Categories ── */}
          <SectionHeader title="Categories" subtitle="Shop by category" />
          <div className="grid grid-cols-2 gap-3 px-4">
            {categoriesQuery.isLoading
              ? Array.from({ length: 8 }).map((_, i) => <FreqCardSkeleton key={i} />)
              : (categories ?? GROCERY_GRID).map((c) => (
                  <Link
                    key={c.slug}
                    to="/category/$slug"
                    params={{ slug: c.slug }}
                    className="flex items-center gap-3 rounded-2xl p-3.5 transition-transform active:scale-[0.97]"
                    style={{ background: (c as any).bg ?? "#f5f5f5" }}
                  >
                    <span className="text-3xl">{(c as any).emoji ?? "🛒"}</span>
                    <span className="text-sm font-bold leading-tight">{c.name}</span>
                  </Link>
                ))}
          </div>

          {/* ── 6. See All Categories CTA ── */}
          <Link
            to="/search"
            className="mx-4 mt-5 flex items-center gap-3 rounded-2xl bg-muted px-4 py-3 transition-opacity active:opacity-70"
          >
            <div className="flex -space-x-2">
              {(categories ?? GROCERY_GRID).slice(0, 5).map((c, i) => (
                <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-card text-lg">
                  {(c as any).emoji ?? "🛒"}
                </div>
              ))}
            </div>
            <p className="flex-1 text-sm font-semibold">See all categories</p>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          {/* ── 7. Grocery & Kitchen 4-col grid ── */}
          <SectionHeader title="Grocery & Kitchen" subtitle="Everything for your home" />
          <div className="grid grid-cols-4 gap-3 px-4">
            {GROCERY_GRID.map((item) => (
              <Link key={item.slug} to="/category/$slug" params={{ slug: item.slug }} className="flex flex-col items-center gap-1.5 transition-transform active:scale-95">
                <div
                  className="flex h-16 w-full items-center justify-center rounded-2xl text-3xl"
                  style={{ background: item.bg }}
                >
                  {item.emoji}
                </div>
                <span className="text-center text-[9px] font-semibold leading-tight">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* ── 8. Product Carousels ── */}
          <ProductSection title="Best offers" subtitle="Handpicked deals" items={offers} loading={offersQuery.isLoading} />
          {(bestsellersQuery.data?.length ?? 0) > 0 && (
            <ProductSection title="⭐ Bestsellers" subtitle="Customers love these" items={bestsellers} loading={bestsellersQuery.isLoading} />
          )}
          <ProductSection title="Daily essentials" subtitle="Stock your pantry" items={essentials} loading={essentialsQuery.isLoading} />

          {/* ── Wholesale Banner ── */}
          <Link to="/search" className="mx-4 mt-6 block overflow-hidden rounded-[20px] ink-shadow active:opacity-90 transition-opacity">
            <img
              src="/banner-main.png?v=2"
              alt="Sasta Bhi Best Bhi — Bachat Bazaar"
              className="w-full object-cover"
              style={{ aspectRatio: "2.4 / 1" }}
            />
          </Link>

          <ProductSection title="Fresh vegetables" subtitle="Sourced this morning" items={veg} loading={vegQuery.isLoading} />
          <ProductSection title="Wholesale picks" subtitle="Save more on bulk" items={wholesale} loading={wholesaleQuery.isLoading} />

          <p className="mt-10 px-4 pb-4 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
            Powered by SK Digitaltech
          </p>
        </>
      )}
    </div>
  );
}

function ProductSection({
  title,
  subtitle,
  items,
  loading,
}: {
  title: string;
  subtitle?: string;
  items: any[] | null;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <>
        <SectionHeader title={title} subtitle={subtitle} />
        <ProductCarouselSkeleton count={3} />
      </>
    );
  }
  if (!items || items.length === 0) return null;
  return (
    <>
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 no-scrollbar">
        {items.map((p) => (
          <div key={p.id} className="w-[145px] flex-shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </>
  );
}
