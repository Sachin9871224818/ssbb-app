import { createFileRoute, Link } from "@tanstack/react-router";
import { useCategories } from "@/hooks/use-api";
import { TopBar } from "@/components/app/TopBar";
import { categories as fallbackCategories } from "@/lib/data";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [{ title: "All Categories — Shri Shyam Bachat Bazaar" }],
  }),
  component: CategoriesPage,
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
          : cats.map((cat) => {
              const banner = CATEGORY_BANNERS[cat.slug];
              return (
                <Link
                  key={cat.slug}
                  to="/category/$slug"
                  params={{ slug: cat.slug }}
                  className="overflow-hidden rounded-2xl transition-transform active:scale-95"
                >
                  {banner ? (
                    <img
                      src={banner}
                      alt={cat.name}
                      className="w-full h-auto block"
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="flex flex-col justify-between p-4"
                      style={{ background: (cat as any).bg ?? "#f5f5f5", height: "110px" }}
                    >
                      <span className="text-4xl leading-none">{(cat as any).emoji ?? "🛒"}</span>
                      <div>
                        <p className="text-sm font-bold leading-tight">{cat.name}</p>
                        <p className="mt-0.5 text-[10px] font-semibold opacity-50">Shop now →</p>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
      </div>
    </div>
  );
}
