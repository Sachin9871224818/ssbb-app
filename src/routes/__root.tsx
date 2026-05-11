import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { BottomNav } from "@/components/app/BottomNav";
import { StickyCartBar } from "@/components/app/StickyCartBar";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">This aisle seems empty.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-primary">
          Back to shop
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold">Something didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-4 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-primary"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1a1a1a" },
      { title: "Shri Shyam Bachat Bazaar — Sasta Bhi, Best Bhi" },
      { name: "description", content: "Premium grocery delivery in Rajokri & Mahipalpur. Order daily essentials, fresh produce and wholesale at Shri Shyam Bachat Bazaar." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

const HIDDEN_ON = ["/splash", "/login", "/order", "/checkout"];

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const hideNav = HIDDEN_ON.some((p) => path.startsWith(p)) || path === "/splash";

  return (
    <QueryClientProvider client={queryClient}>
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-background">
        <Outlet />
      </div>
      {!hideNav && <StickyCartBar />}
      {!hideNav && <BottomNav />}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
