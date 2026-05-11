import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import {
  ShoppingCart, Users, Package, IndianRupee,
  Clock, TrendingUp, AlertCircle,
} from "lucide-react";

type Stats = {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
  pendingOrders: number;
  todayOrders: number;
};

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.get("/api/admin/stats"),
      adminApi.get("/api/admin/orders?limit=5"),
    ]).then(([s, o]) => {
      setStats(s.data.data);
      setRecentOrders(o.data.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const STATUS_COLOR: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PACKED: "bg-purple-100 text-purple-700",
    OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Dashboard Overview</h2>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString("en-IN") ?? 0}`}
          sub="Excluding cancelled orders"
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={stats?.totalOrders ?? 0}
          sub={`${stats?.todayOrders ?? 0} today`}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Clock}
          label="Pending Orders"
          value={stats?.pendingOrders ?? 0}
          sub="Awaiting confirmation"
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={stats?.totalCustomers ?? 0}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          icon={Package}
          label="Products"
          value={stats?.totalProducts ?? 0}
          color="bg-pink-50 text-pink-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Order Value"
          value={`₹${stats && stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString("en-IN") : 0}`}
          color="bg-indigo-50 text-indigo-600"
        />
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          <AlertCircle className="h-4 w-4 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-mono font-semibold text-gray-900">{o.orderNumber}</td>
                  <td className="px-6 py-3 text-gray-700">{o.user?.name ?? "—"}</td>
                  <td className="px-6 py-3 font-semibold text-gray-900">₹{o.total}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
