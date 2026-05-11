import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Grid3X3,
  Megaphone, Tag, Users, Clock, BarChart3,
  LogOut, Menu, X, ShoppingBag, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Overview } from "@/components/admin/Overview";
import { OrdersSection } from "@/components/admin/OrdersSection";
import { ProductsSection } from "@/components/admin/ProductsSection";
import { CategoriesSection } from "@/components/admin/CategoriesSection";
import { BannersSection } from "@/components/admin/BannersSection";
import { CouponsSection } from "@/components/admin/CouponsSection";
import { CustomersSection } from "@/components/admin/CustomersSection";
import { SlotsSection } from "@/components/admin/SlotsSection";
import { AnalyticsSection } from "@/components/admin/AnalyticsSection";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — SSBB" }] }),
  component: AdminDashboard,
});

type Section =
  | "overview" | "orders" | "products" | "categories"
  | "banners" | "coupons" | "customers" | "slots" | "analytics";

const NAV: { id: Section; label: string; icon: any; badge?: string }[] = [
  { id: "overview",    label: "Overview",        icon: LayoutDashboard },
  { id: "orders",      label: "Orders",          icon: ShoppingCart },
  { id: "products",    label: "Products",        icon: Package },
  { id: "categories",  label: "Categories",      icon: Grid3X3 },
  { id: "banners",     label: "Banners",         icon: Megaphone },
  { id: "coupons",     label: "Coupons",         icon: Tag },
  { id: "customers",   label: "Customers",       icon: Users },
  { id: "slots",       label: "Delivery Slots",  icon: Clock },
  { id: "analytics",   label: "Analytics",       icon: BarChart3 },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const user = localStorage.getItem("admin_user");
    if (!token) { navigate({ to: "/admin/login" }); return; }
    if (user) setAdminUser(JSON.parse(user));
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    toast.success("Logged out");
    navigate({ to: "/admin/login" });
  };

  const go = (id: Section) => { setActive(id); setSidebarOpen(false); };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-950 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
          <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="h-5 w-5 text-gray-900" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">SSBB Admin</p>
            <p className="text-gray-500 text-xs">Shri Shyam Bachat Bazaar</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active === id
                  ? "bg-yellow-400 text-gray-900"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="h-4.5 w-4.5 flex-shrink-0 h-5 w-5" />
              <span>{label}</span>
              {active === id && <ChevronRight className="h-4 w-4 ml-auto opacity-60" />}
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-gray-900 flex-shrink-0">
              {adminUser?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{adminUser?.name ?? "Admin"}</p>
              <p className="text-gray-500 text-xs truncate">{adminUser?.email ?? ""}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center gap-4 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900 capitalize">
              {NAV.find(n => n.id === active)?.label ?? "Dashboard"}
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              Shri Shyam Bachat Bazaar · Admin Panel
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 hidden sm:flex items-center gap-1.5"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> View Store
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {active === "overview"   && <Overview />}
          {active === "orders"     && <OrdersSection />}
          {active === "products"   && <ProductsSection />}
          {active === "categories" && <CategoriesSection />}
          {active === "banners"    && <BannersSection />}
          {active === "coupons"    && <CouponsSection />}
          {active === "customers"  && <CustomersSection />}
          {active === "slots"      && <SlotsSection />}
          {active === "analytics"  && <AnalyticsSection />}
        </main>
      </div>
    </div>
  );
}
