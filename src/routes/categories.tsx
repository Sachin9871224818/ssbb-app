import { createFileRoute, Link } from "@tanstack/react-router";
import { useCategories } from "@/hooks/use-api";
import { TopBar } from "@/components/app/TopBar";
import { categories as fallbackCategories } from "@/lib/data";
import { CategoryIconSkeleton } from "@/components/app/Skeleton";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [{ title: "All Categories — Shri Shyam Bachat Bazaar" }],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const q = useCategories();
  const cats = q.data ?? (q.isLoading ? null : fallbackCategories.map((c) => ({ ...c, id: c.slug })));

  return (
    <div className="pb-36">
      <TopBar title="All Categories" />

      <div className="grid grid-cols-2 gap-3 p-4">
        {cats === null
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
            ))
          : cats.map((cat) => (
              <Link
                key={cat.slug}
                to="/category/$slug"
                params={{ slug: cat.slug }}
                className="relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 transition-transform active:scale-95"
                style={{ background: (cat as any).bg ?? "#f5f5f5", minHeight: "110px" }}
              >
                <span className="text-4xl leading-none">{(cat as any).emoji ?? "🛒"}</span>
                <div className="mt-3">
                  <p className="text-sm font-bold leading-tight">{cat.name}</p>
                  <p className="mt-0.5 text-[10px] font-semibold opacity-50">Shop now →</p>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
}
