import type { ReactNode } from "react";

export function MobileShell({ children, withNav = true }: { children: ReactNode; withNav?: boolean }) {
  return (
    <div className="min-h-screen w-full bg-muted/40">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-background ink-shadow">
        <div className={withNav ? "flex-1 pb-24" : "flex-1"}>{children}</div>
      </div>
    </div>
  );
}
