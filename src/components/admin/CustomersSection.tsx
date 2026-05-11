import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import { Search, Users } from "lucide-react";

export function CustomersSection() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE = 20;

  const fetch = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE) });
    if (search) params.set("search", search);
    adminApi.get(`/api/admin/customers?${params}`)
      .then(r => { setCustomers(r.data.data); setTotal(r.data.total); })
      .catch(console.error).finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [search]);

  const pages = Math.ceil(total / PAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Customers <span className="text-gray-400 font-normal text-base">({total})</span></h2>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…"
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 bg-white" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Orders</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Addresses</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-sm font-bold text-yellow-700 flex-shrink-0">
                          {c.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{c.phone ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                        {c._count?.orders ?? 0} orders
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{c._count?.addresses ?? 0}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />No customers found
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
