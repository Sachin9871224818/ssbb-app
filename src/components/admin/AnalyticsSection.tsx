import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  CONFIRMED: "#3B82F6",
  PACKED: "#8B5CF6",
  OUT_FOR_DELIVERY: "#F97316",
  DELIVERED: "#22C55E",
  CANCELLED: "#EF4444",
};

export function AnalyticsSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get("/api/admin/analytics").then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent" /></div>;

  const revenueByDay = (data?.revenueByDay ?? []).slice(-14);
  const byStatus = data?.byStatus ?? [];
  const topProducts = data?.topProducts ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Analytics</h2>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Revenue — Last 14 Days</h3>
        {revenueByDay.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]}
                labelFormatter={l => `Date: ${l}`}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Bar dataKey="revenue" fill="#FFC83D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-10">No data in last 14 days</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Orders by Status</h3>
          {byStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75} label={({ status, count }) => `${count}`}>
                  {byStatus.map((entry: any, i: number) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.status] ?? "#CBD5E1"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any, n: any) => [v, n]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend formatter={(v) => v.replace(/_/g, " ")} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">No data yet</p>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Top Products by Revenue</h3>
          <div className="space-y-3">
            {topProducts.map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${Math.min(100, (p.revenue / (topProducts[0]?.revenue || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">₹{Number(p.revenue).toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{p.quantity} sold</span>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-gray-400 text-center py-6">No orders yet</p>}
          </div>
        </div>
      </div>

      {/* Daily orders chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Daily Orders — Last 14 Days</h3>
        {revenueByDay.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                formatter={(v: any) => [v, "Orders"]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Bar dataKey="orders" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-8">No data in last 14 days</p>
        )}
      </div>
    </div>
  );
}
