import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function SectionHeader({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="flex items-end justify-between px-4 pb-2 pt-5">
      <div>
        <h2 className="text-base font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {href && (
        <Link to={href as any} className="flex items-center gap-0.5 text-xs font-semibold text-secondary">
          See all <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
