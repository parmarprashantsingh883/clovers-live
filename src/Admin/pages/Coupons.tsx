import { useEffect, useState } from "react";
import { api, errMsg } from "@/lib/api";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { Plus, Trash2, Power } from "lucide-react";
import { toast } from "sonner";

const EMPTY = { code: "", type: "percent", value: "", maxDiscount: "", minOrder: "", expiresAt: "", usageLimit: "", perUserLimit: "", description: "" };

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [deleting, setDeleting] = useState<any>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const { data } = await api.get("/coupons");
      setCoupons(data);
    } catch (e) { toast.error(errMsg(e)); }
  };

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  const create = async () => {
    try {
      const payload: any = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        description: form.description,
      };
      if (form.minOrder) payload.minOrder = Number(form.minOrder);
      if (form.maxDiscount) payload.maxDiscount = Number(form.maxDiscount);
      if (form.usageLimit) payload.usageLimit = Number(form.usageLimit);
      if (form.perUserLimit) payload.perUserLimit = Number(form.perUserLimit);
      if (form.expiresAt) payload.expiresAt = form.expiresAt;

      await api.post("/coupons", payload);
      toast.success(`Coupon ${payload.code} created`);
      setCreating(false);
      setForm(EMPTY);
      fetchAll();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const toggleActive = async (c: any) => {
    try {
      await api.put(`/coupons/${c.code}`, { active: !c.active });
      toast.success(`${c.code} ${c.active ? "deactivated" : "activated"}`);
      fetchAll();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const remove = async () => {
    try {
      await api.delete(`/coupons/${deleting.code}`);
      toast.success(`${deleting.code} deleted`);
      setDeleting(null);
      fetchAll();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const fmtValue = (c: any) =>
    c.type === "percent"
      ? `${c.value}%${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ""}`
      : `₹${c.value}`;

  return (
    <div>
      <Header title="Coupons" subtitle="Create and manage discount codes" />

      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-700"
          >
            <Plus size={16} /> New Coupon
          </button>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min Order</th>
                <th className="p-4">Used</th>
                <th className="p-4">Expires</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No coupons yet — create your first discount code.</td></tr>
              )}
              {coupons.map((c) => (
                <tr key={c.code} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-mono font-bold">{c.code}</p>
                    <p className="text-xs text-gray-500">{c.description}</p>
                  </td>
                  <td className="p-4 text-center font-semibold">{fmtValue(c)}</td>
                  <td className="p-4 text-center">{c.minOrder ? `₹${c.minOrder}` : "—"}</td>
                  <td className="p-4 text-center">
                    {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="p-4 text-center text-sm">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      c.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      title={c.active ? "Deactivate" : "Activate"}
                      onClick={() => toggleActive(c)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
                    >
                      <Power size={14} /> {c.active ? "Disable" : "Enable"}
                    </button>
                    <button
                      title="Delete"
                      onClick={() => setDeleting(c)}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE */}
      <Modal isOpen={creating} onClose={() => setCreating(false)} title="New Coupon">
        <div className="grid grid-cols-2 gap-3">
          <input className="border rounded-xl px-4 py-2.5 font-mono uppercase" placeholder="CODE"
            value={form.code} onChange={(e) => set("code", e.target.value)} />
          <select className="border rounded-xl px-4 py-2.5" value={form.type} onChange={(e) => set("type", e.target.value)}>
            <option value="percent">Percent off</option>
            <option value="flat">Flat ₹ off</option>
          </select>
          <input className="border rounded-xl px-4 py-2.5" type="number"
            placeholder={form.type === "percent" ? "Percent (1–90)" : "Amount ₹"}
            value={form.value} onChange={(e) => set("value", e.target.value)} />
          {form.type === "percent" && (
            <input className="border rounded-xl px-4 py-2.5" type="number" placeholder="Max discount ₹ (optional)"
              value={form.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)} />
          )}
          <input className="border rounded-xl px-4 py-2.5" type="number" placeholder="Min order ₹ (optional)"
            value={form.minOrder} onChange={(e) => set("minOrder", e.target.value)} />
          <input className="border rounded-xl px-4 py-2.5" type="date"
            value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
          <input className="border rounded-xl px-4 py-2.5" type="number" placeholder="Total usage limit (optional)"
            value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} />
          <input className="border rounded-xl px-4 py-2.5" type="number" placeholder="Per-user limit (optional)"
            value={form.perUserLimit} onChange={(e) => set("perUserLimit", e.target.value)} />
          <input className="border rounded-xl px-4 py-2.5 col-span-2" placeholder="Description shown to customers"
            value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="flex justify-end gap-3 pt-5">
          <button onClick={() => setCreating(false)} className="px-6 py-2 border rounded-xl">Cancel</button>
          <button onClick={create} disabled={!form.code || !form.value}
            className="px-6 py-2 rounded-xl text-white bg-red-600 disabled:opacity-50">
            Create Coupon
          </button>
        </div>
      </Modal>

      {/* DELETE CONFIRM */}
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Delete coupon">
        <p className="text-sm text-gray-600">
          Delete <b className="font-mono">{deleting?.code}</b>? Customers will no longer be able to apply it.
        </p>
        <div className="flex justify-end gap-3 pt-5">
          <button onClick={() => setDeleting(null)} className="px-6 py-2 border rounded-xl">Cancel</button>
          <button onClick={remove} className="px-6 py-2 rounded-xl text-white bg-red-600">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
