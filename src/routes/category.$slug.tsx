import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { categories, productsByCategory } from "@/lib/data";
import { ProductCard } from "@/components/app/ProductCard";
import { TopBar } from "@/components/app/TopBar";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.cat.name ?? "Category"} — Shri Shyam Bachat Bazaar` },
      { name: "description", content: `Shop ${loaderData?.cat.name} online at the best prices in Delhi.` },
    ],
  }),
  errorComponent: ({ error }) => <p className="p-6 text-sm">{error.message}</p>,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <p className="text-2xl">🛒</p>
      <p className="mt-2 text-sm">Category not found</p>
      <Link to="/" className="mt-4 rounded-full bg-secondary px-5 py-2 text-xs font-bold text-primary">Browse all</Link>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { cat } = Route.useLoaderData();
  const items = productsByCategory(cat.slug);

  return (
    <div>
      <TopBar title={cat.name} />
      <div className="px-4 pt-2">
        <div className="flex items-center gap-3 rounded-3xl p-4 ink-shadow" style={{ background: cat.bg }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/60 text-3xl">{cat.emoji}</div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-secondary/70">Category</p>
            <p className="text-base font-extrabold">{cat.name}</p>
            <p className="text-[11px] text-secondary/70">{items.length} products</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 py-4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {items.length === 0 && (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">Coming soon — stay tuned!</p>
      )}
    </div>
  );
}
