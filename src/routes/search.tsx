import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCategories, useProductSearch } from "@/hooks/use-api";
import { categories as fallbackCategories } from "@/lib/data";
import { ProductCard } from "@/components/app/ProductCard";
import { TopBar } from "@/components/app/TopBar";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — Shri Shyam Bachat Bazaar" }] }),
  component: SearchPage,
});

const trending = ["atta", "milk", "eggs", "tomato", "basmati", "amul butter", "almonds"];

function SearchPage() {
  const [q, setQ] = useState("");
  const categoriesQuery = useCategories();
  const searchQuery = useProductSearch(q);

  const categories = categoriesQuery.data ?? fallbackCategories.map((c) => ({ ...c, id: c.slug }));
  const results = searchQuery.data ?? [];

  return (
    <div>
      <TopBar
        right={
          <div className="flex flex-1 items-center gap-2 rounded-full bg-card px-3 py-2 ink-shadow">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            {q && !searchQuery.isFetching && <button onClick={() => setQ("")}><X className="h-4 w-4 text-muted-foreground" /></button>}
            {searchQuery.isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        }
      />

      <div className="px-4">
        {!q && (
          <>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Trending searches</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {trending.map((t) => (
                <button key={t} onClick={() => setQ(t)} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold capitalize">{t}</button>
              ))}
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Browse categories</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <div key={c.slug} className="flex flex-col items-center gap-1 rounded-2xl p-3" style={{ background: c.bg ?? undefined }}>
                  <span className="text-2xl">{c.emoji}</span>
                  <span className="text-center text-[10px] font-semibold">{c.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {q && (
          <>
            <p className="mt-2 text-xs text-muted-foreground">{results.length} results for "{q}"</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {results.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {!searchQuery.isFetching && results.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">No products found. Try another keyword.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
