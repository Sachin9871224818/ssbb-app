import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import { Search, RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["ALL", "PENDING", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PACKED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function StatusSelect({ orderId, current, onUpdated }: { orderId: string; current: string; onUpdated: () => void }) {
  const [loading, setLoading] = useState(false);
  const update = async (status: string) => {
    if (status === current) return;
    setLoading(true);
    try {
      await adminApi.put(`/api/admin/orders/${orderId}/status`, { status });
      toast.success("Status updated");
      onUpdated();
    } catch { toast.error("Failed to update status"); }
    finally { setLoading(false); }
  };
  return (
    <div className="relative inline-flex items-center">
      <select
        value={current}
        onChange={(e) => update(e.target.value)}
        disabled={loading}
        className={`appearance-none pl-2.5 pr-7 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none ${STATUS_COLOR[current] ?? "bg-gray-100 text-gray-600"}`}
      >
        {STATUSES.filter(s => s !== "ALL").map(s => (
          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-1.5 h-3 w-3 pointer-events-none opacity-60" />
    </div>
  );
}

export function OrdersSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const PAGE = 15;

  const fetch = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE) });
    if (search) params.set("search", search);
    if (status !== "ALL") params.set("status", status);
    adminApi.get(`/api/admin/orders?${params}`)
      .then(r => { setOrders(r.data.data); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, status, page]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [search, status]);

  const pages = Math.ceil(total / PAGE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Orders <span className="text-gray-400 font-normal text-base">({total})</span></h2>
        <button onClick={fetch} className="self-start sm:self-auto flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search order, customer…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 bg-white"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${status === s ? "bg-yellow-400 text-gray-900" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Order #</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Items</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Slot</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o) => (
                  <>
                    <tr
                      key={o.id}
                      className="hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    >
                      <td className="px-5 py-3 font-mono font-bold text-gray-900">{o.orderNumber}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{o.user?.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{o.user?.phone ?? o.user?.email}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{o.items?.length ?? 0} items</td>
                      <td className="px-5 py-3 font-bold text-gray-900">₹{o.total}</td>
                      <td className="px-5 py-3 text-gray-600 capitalize">{o.deliverySlot}</td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-5 py-3">
                        <StatusSelect orderId={o.id} current={o.status} onUpdated={fetch} />
                      </td>
                    </tr>
                    {expanded === o.id && (
                      <tr key={`${o.id}-exp`} className="bg-yellow-50/40">
                        <td colSpan={7} className="px-5 py-3">
                          <div className="text-xs space-y-1">
                            <p className="font-semibold text-gray-700 mb-2">Order Items:</p>
                            {o.items?.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-2">
                                <span>{item.emoji}</span>
                                <span className="text-gray-700">{item.name}</span>
                                <span className="text-gray-400">({item.qtyLabel})</span>
                                <span className="ml-auto font-semibold">×{item.quantity} = ₹{item.lineTotal}</span>
                              </div>
                            ))}
                            {o.addressSnapshot && (
                              <p className="text-gray-500 mt-2 pt-2 border-t border-yellow-100">
                                📍 {o.addressSnapshot.line1}, {o.addressSnapshot.city} — {o.addressSnapshot.pincode}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Previous
            </button>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
