function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-muted ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[18px] border border-border/40 bg-card">
      <Shimmer className="h-[120px] rounded-none rounded-t-[18px]" />
      <div className="flex flex-col gap-2 p-2.5">
        <Shimmer className="h-2.5 w-10 rounded-md" />
        <Shimmer className="h-3 w-full rounded-md" />
        <Shimmer className="h-3 w-3/4 rounded-md" />
        <div className="flex items-end justify-between pt-1">
          <div className="flex flex-col gap-1">
            <Shimmer className="h-4 w-10 rounded-md" />
            <Shimmer className="h-2.5 w-7 rounded-md" />
          </div>
          <Shimmer className="h-8 w-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CategoryIconSkeleton() {
  return (
    <div className="flex flex-shrink-0 flex-col items-center gap-1.5">
      <Shimmer className="h-[58px] w-[58px] rounded-2xl" />
      <Shimmer className="h-2 w-12 rounded-md" />
    </div>
  );
}

export function BannerSkeleton() {
  return <Shimmer className="h-[130px] min-w-[88%] rounded-[20px]" />;
}

export function FreqCardSkeleton() {
  return <Shimmer className="h-[110px] rounded-[20px]" />;
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductCarouselSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-2.5 overflow-hidden px-4 pb-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-[145px] flex-shrink-0">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}
