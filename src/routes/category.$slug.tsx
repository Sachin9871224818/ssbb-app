import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/app/ProductCard";
import { TopBar } from "@/components/app/TopBar";
import { ProductGridSkeleton } from "@/components/app/Skeleton";
import { useCategoryProducts } from "@/hooks/use-api";
import { categories as fallbackCategories, productsByCategory } from "@/lib/data";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Shri Shyam Bachat Bazaar` },
      { name: "description", content: `Shop ${params.slug} online at the best prices in Delhi.` },
    ],
  }),
  component: CategoryPage,
});

const CATEGORY_BANNERS: Record<string, string> = {
  vegetables: "/categories/cat-vegetables.jpg",
  fruits:     "/categories/cat-fruits.jpg",
  dairy:      "/categories/cat-dairy.jpg",
  snacks:     "/categories/cat-snacks.jpg",
  essentials: "/categories/cat-essentials.jpg",
  wholesale:  "/categories/cat-wholesale.jpg",
  household:  "/categories/cat-household.jpg",
  beauty:     "/categories/cat-beauty.jpg",
  dryfruits:  "/categories/cat-dryfruits.jpg",
};

function CategoryPage() {
  const { slug } = Route.useParams();
  const query = useCategoryProducts(slug);

  const cat = query.data ?? ((): any => {
    if (query.isLoading) return null;
    const fb = fallbackCategories.find((c) => c.slug === slug);
    return fb ? { ...fb, id: fb.slug, products: productsByCategory(slug) } : null;
  })();

  if (query.isLoading) {
    return (
      <div className="pb-36">
        <TopBar title="Loading…" />
        <div className="px-4 pt-2">
          <div className="h-[130px] animate-pulse rounded-3xl bg-muted" />
        </div>
        <ProductGridSkeleton count={6} />
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <p className="text-2xl">🛒</p>
        <p className="mt-2 text-sm">Category not found</p>
        <Link to="/" className="mt-4 rounded-full bg-secondary px-5 py-2 text-xs font-bold text-secondary-foreground">Browse all</Link>
      </div>
    );
  }

  const items = cat.products ?? [];
  const banner = CATEGORY_BANNERS[slug];

  return (
    <div className="pb-36">
      <TopBar title={cat.name} />

      <div className="px-4 pt-2">
        {banner ? (
          <img
            src={banner}
            alt={cat.name}
            className="w-full rounded-3xl object-cover"
            style={{ maxHeight: "140px", objectPosition: "center" }}
            draggable={false}
          />
        ) : (
          <div className="flex items-center gap-3 rounded-3xl p-4 ink-shadow" style={{ background: (cat as any).bg ?? undefined }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/60 text-3xl">{(cat as any).emoji}</div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-secondary/70">Category</p>
              <p className="text-base font-extrabold">{cat.name}</p>
              <p className="text-[11px] text-secondary/70">{items.length} products</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 py-4">
        {items.map((p: any) => <ProductCard key={p.id} product={p} />)}
      </div>
      {items.length === 0 && (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">Coming soon — stay tuned!</p>
      )}
    </div>
  );
}
