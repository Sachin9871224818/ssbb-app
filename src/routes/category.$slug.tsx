import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/app/ProductCard";
import { TopBar } from "@/components/app/TopBar";
import { useCategoryProducts } from "@/hooks/use-api";
import { categories as fallbackCategories, productsByCategory } from "@/lib/data";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Shri Shyam Bachat Bazaar` },
      { name: "description", content: `Shop ${params.slug} online at the best prices in Delhi.` },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const query = useCategoryProducts(slug);

  const cat = query.data ?? ((): any => {
    const fb = fallbackCategories.find((c) => c.slug === slug);
    return fb ? { ...fb, id: fb.slug, products: productsByCategory(slug) } : null;
  })();

  if (query.isLoading) {
    return (
      <div>
        <TopBar title={slug} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <p className="text-2xl">🛒</p>
        <p className="mt-2 text-sm">Category not found</p>
        <Link to="/" className="mt-4 rounded-full bg-secondary px-5 py-2 text-xs font-bold text-primary">Browse all</Link>
      </div>
    );
  }

  const items = cat.products ?? [];

  return (
    <div className="pb-36">
      <TopBar title={cat.name} />
      <div className="px-4 pt-2">
        <div className="flex items-center gap-3 rounded-3xl p-4 ink-shadow" style={{ background: cat.bg ?? undefined }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/60 text-3xl">{cat.emoji}</div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-secondary/70">Category</p>
            <p className="text-base font-extrabold">{cat.name}</p>
            <p className="text-[11px] text-secondary/70">{items.length} products</p>
          </div>
        </div>
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
