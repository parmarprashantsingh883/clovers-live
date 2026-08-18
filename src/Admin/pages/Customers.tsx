import { useEffect, useState } from "react";
import { api, errMsg } from "@/lib/api";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { Search, ShieldBan, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [confirming, setConfirming] = useState<any>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [users, orders] = await Promise.all([api.get("/users"), api.get("/orders")]);
      const enriched = users.data.map((u: any) => {
        const userOrders = orders.data.filter((o: any) => String(o.userId) === String(u.id));
        return {
          ...u,
          orders: userOrders.length,
          spent: userOrders.filter((o: any) => o.status !== "Cancelled").reduce((s: number, o: any) => s + (o.total || 0), 0),
          joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—",
        };
      });
      setCustomers(enriched);
    } catch (e) { toast.error(errMsg(e)); }
  };

  const filtered = customers.filter((c) =>
    (c.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (c: any) => {
    try {
      const status = c.status === "active" ? "blocked" : "active";
      await api.patch(`/users/${c.id}`, { status });
      toast.success(`${c.fullName} is now ${status}`);
      setConfirming(null);
      fetchAll();
    } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div>
      <Header title="Customers" subtitle="Manage your customer base" />

      <div className="p-6 space-y-6">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border px-4 py-2 rounded-xl w-full"
          />
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Total Spent</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-500">
                      {(c.fullName || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold">{c.fullName}</p>
                      <p className="text-sm text-gray-500">{c.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-center">{c.orders}</td>
                  <td className="p-4 text-center font-semibold">₹{c.spent.toLocaleString("en-IN")}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      c.status === "active" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">{c.joined}</td>
                  <td className="p-4 text-right">
                    <button
                      title={c.status === "active" ? "Block customer" : "Unblock customer"}
                      onClick={() => setConfirming(c)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
                    >
                      {c.status === "active" ? <ShieldBan size={15} /> : <ShieldCheck size={15} />}
                      {c.status === "active" ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BLOCK / UNBLOCK CONFIRM */}
      <Modal
        isOpen={!!confirming}
        onClose={() => setConfirming(null)}
        title={confirming?.status === "active" ? "Block customer" : "Unblock customer"}
      >
        <p className="text-sm text-gray-600">
          {confirming?.status === "active"
            ? <>Block <b>{confirming?.fullName}</b>? They will not be able to sign in or place orders until unblocked.</>
            : <>Unblock <b>{confirming?.fullName}</b>? They will regain full access.</>}
        </p>
        <div className="flex justify-end gap-3 pt-5">
          <button onClick={() => setConfirming(null)} className="px-6 py-2 border rounded-xl">Cancel</button>
          <button
            onClick={() => toggleStatus(confirming)}
            className={`px-6 py-2 rounded-xl text-white ${confirming?.status === "active" ? "bg-red-600" : "bg-green-600"}`}
          >
            {confirming?.status === "active" ? "Block" : "Unblock"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
