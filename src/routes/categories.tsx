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

function CategoriesPage() {
  const q = useCategories();
  const cats = q.data ?? fallbackCategories.map((c) => ({ ...c, id: c.slug }));

  return (
    <div>
      <TopBar title="All Categories" />
      <div className="grid grid-cols-2 gap-4 p-4">
        {cats.map((cat) => (
          <Link
            key={cat.slug}
            to="/category/$slug"
            params={{ slug: cat.slug }}
            className="relative overflow-hidden rounded-2xl transition-transform active:scale-95"
            style={{ background: (cat as any).bg ?? "#f5f5f5" }}
          >
            <div className="flex flex-col p-4">
              <span className="text-4xl">{(cat as any).emoji}</span>
              <p className="mt-2 text-sm font-bold leading-tight">{cat.name}</p>
              <p className="mt-0.5 text-[10px] font-medium opacity-60">Shop now →</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
}
