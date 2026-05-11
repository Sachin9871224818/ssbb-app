import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function TopBar({ title, right, transparent }: { title?: string; right?: ReactNode; transparent?: boolean }) {
  const router = useRouter();
  return (
    <div
      className={`sticky top-0 z-20 flex items-center justify-between gap-3 px-3 py-3 ${
        transparent ? "" : "border-b border-border/60 bg-background/95 backdrop-blur"
      }`}
    >
      <button
        onClick={() => router.history.back()}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-card ink-shadow"
        aria-label="Back"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      {title && <h1 className="flex-1 truncate text-center text-sm font-bold">{title}</h1>}
      <div className="flex h-10 min-w-10 items-center justify-end">{right}</div>
    </div>
  );
}
