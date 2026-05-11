import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import { Plus, Pencil, Trash2, X, Clock } from "lucide-react";
import { toast } from "sonner";

type Slot = { id: string; slotKey: string; label: string; time: string; icon: string | null; capacity: string; isActive: boolean; sortOrder: number };
const EMPTY = { slotKey: "", label: "", time: "", icon: "🕐", capacity: "Available", isActive: true, sortOrder: 0 };

function Modal({ title, onClose, onSave, saving, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5">{children}</div>
        <div className="flex gap-2 justify-end p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-2 text-sm bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-300 disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const CAPACITY_OPTS = ["Available", "Filling fast", "Fully booked"];

export function SlotsSection() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(() => {
    setLoading(true);
    adminApi.get("/api/admin/slots").then(r => setSlots(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm({ ...EMPTY }); setEditing(null); setModal(true); };
  const openEdit = (s: Slot) => { setForm({ ...s }); setEditing(s.id); setModal(true); };
  const close = () => { setModal(false); setEditing(null); };
  const F = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await adminApi.put(`/api/admin/slots/${editing}`, form);
      else await adminApi.post("/api/admin/slots", form);
      toast.success(editing ? "Slot updated" : "Slot created");
      close(); fetch();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const del = async (id: string, label: string) => {
    if (!confirm(`Delete slot "${label}"?`)) return;
    try { await adminApi.delete(`/api/admin/slots/${id}`); toast.success("Deleted"); fetch(); }
    catch { toast.error("Failed to delete"); }
  };

  const toggleActive = async (s: Slot) => {
    try { await adminApi.put(`/api/admin/slots/${s.id}`, { isActive: !s.isActive }); fetch(); }
    catch { toast.error("Failed to update"); }
  };

  const CAPACITY_STYLE: Record<string, string> = {
    "Available": "bg-green-100 text-green-700",
    "Filling fast": "bg-amber-100 text-amber-700",
    "Fully booked": "bg-red-100 text-red-700",
  };

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Delivery Slots <span className="text-gray-400 font-normal text-base">({slots.length})</span></h2>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-4 py-2 rounded-xl text-sm">
          <Plus className="h-4 w-4" /> Add Slot
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {slots.map(s => (
          <div key={s.id} className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4 ${!s.isActive ? "opacity-60" : "border-gray-100"}`}>
            <div className="w-14 h-14 rounded-xl bg-yellow-50 flex items-center justify-center text-2xl flex-shrink-0">
              {s.icon ?? "🕐"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{s.label}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${CAPACITY_STYLE[s.capacity] ?? "bg-gray-100 text-gray-600"}`}>
                  {s.capacity}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{s.time}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{s.slotKey}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => toggleActive(s)}
                className={`text-xs px-2 py-1 rounded-lg font-semibold ${s.isActive ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                {s.isActive ? "Deactivate" : "Activate"}
              </button>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="flex-1 p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 flex justify-center"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => del(s.id, s.label)} className="flex-1 p-1.5 hover:bg-red-50 rounded-lg text-red-500 flex justify-center"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
        {slots.length === 0 && <p className="text-gray-400 col-span-2 text-center py-10">No delivery slots found</p>}
      </div>

      {modal && (
        <Modal title={editing ? "Edit Slot" : "Add Slot"} onClose={close} onSave={save} saving={saving}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Label *</label>
                <input value={form.label} onChange={e => F("label", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Key * (lowercase)</label>
                <input value={form.slotKey} onChange={e => F("slotKey", e.target.value.toLowerCase())}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 font-mono" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Time Range *</label>
              <input value={form.time} onChange={e => F("time", e.target.value)} placeholder="e.g. 7 AM – 10 AM"
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Icon (emoji)</label>
                <input value={form.icon ?? ""} onChange={e => F("icon", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 text-center text-2xl" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => F("sortOrder", parseInt(e.target.value))}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Capacity Status</label>
              <select value={form.capacity} onChange={e => F("capacity", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                {CAPACITY_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="slotActive" checked={form.isActive} onChange={e => F("isActive", e.target.checked)} className="rounded" />
              <label htmlFor="slotActive" className="text-sm text-gray-700">Active</label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
