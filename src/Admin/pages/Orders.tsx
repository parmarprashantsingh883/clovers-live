import { useEffect, useState } from "react";
import { api, errMsg } from "@/lib/api";
import Header from "../components/Header";
import { Eye, Truck, CheckCircle, XCircle, PackageCheck } from "lucide-react";
import { toast } from "sonner";

import Modal from "../components/Modal";

const STATUSES = ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const STATUS_STYLE: Record<string, string> = {
  Processing: "bg-orange-100 text-orange-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped: "bg-indigo-100 text-indigo-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [o, u] = await Promise.all([api.get("/orders"), api.get("/users")]);
      setOrders(o.data);
      setUsers(u.data);
    } catch (e) { toast.error(errMsg(e)); }
  };

  const getUser = (id: string) => users.find((u) => String(u.id) === String(id));

  const filteredOrders = orders.filter((o) => {
    const user = getUser(o.userId);
    const q = search.toLowerCase();
    return (
      (statusFilter === "all" || o.status === statusFilter) &&
      (o.id.toLowerCase().includes(q) ||
        (user?.fullName || "").toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q))
    );
  });

  const updateStatus = async (order: any, status: string) => {
    try {
      await api.patch(`/orders/${order.id}`, { status });
      toast.success(`Order ${order.id} → ${status}`);
      fetchAll();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const cancelOrder = async (order: any) => {
    if (!window.confirm("Cancel this order?")) return;
    await updateStatus(order, "Cancelled");
  };

  return (
    <div>
      <Header title="Orders" subtitle="Track and manage customer orders" />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex gap-4">
          <input
            placeholder="Search order / customer..."
            className="input w-72"
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input w-40" onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary text-muted-foreground text-sm">
                <th className="p-3 text-left">Order ID</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Items</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Payment</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => {
                const user = getUser(o.userId);
                const itemCount = (o.items || []).reduce((s: number, i: any) => s + (i.qty || 0), 0);
                return (
                  <tr key={o.id} className="border-t hover:bg-secondary/30">
                    <td className="p-3 font-mono text-sm">{o.id}</td>
                    <td className="p-3">{user?.fullName || o.address?.name || "Unknown"}</td>
                    <td className="p-3">{itemCount}</td>
                    <td className="p-3 font-semibold">₹{o.total?.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-xs uppercase">{o.paymentMethod} · {o.payment?.status || "—"}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${STATUS_STYLE[o.status] || "bg-primary/10 text-primary"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{o.date}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="action-btn" title="View order" onClick={() => setViewOrder(o)}>
                          <Eye size={18} />
                        </button>
                        <button
                          className="action-btn" title="Confirm"
                          disabled={o.status !== "Processing"}
                          onClick={() => updateStatus(o, "Confirmed")}
                        >
                          <PackageCheck size={18} />
                        </button>
                        <button
                          className="action-btn warn" title="Mark as shipped"
                          disabled={!["Processing", "Confirmed"].includes(o.status)}
                          onClick={() => updateStatus(o, "Shipped")}
                        >
                          <Truck size={18} />
                        </button>
                        <button
                          className="action-btn success" title="Mark as delivered"
                          disabled={o.status !== "Shipped"}
                          onClick={() => updateStatus(o, "Delivered")}
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          className="action-btn danger" title="Cancel order"
                          disabled={["Delivered", "Cancelled"].includes(o.status)}
                          onClick={() => cancelOrder(o)}
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title={`Order ${viewOrder?.id}`}>
        {viewOrder && (
          <div className="space-y-4">
            <p><b>Status:</b></p>
            <select
              className="input"
              value={viewOrder.status}
              onChange={async (e) => {
                await updateStatus(viewOrder, e.target.value);
                setViewOrder({ ...viewOrder, status: e.target.value });
              }}
            >
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>

            <p><b>Customer:</b> {viewOrder.address?.name} · {viewOrder.address?.phone}</p>
            <p><b>Payment:</b> {viewOrder.paymentMethod?.toUpperCase()} ({viewOrder.payment?.status})</p>
            <p><b>Total:</b> ₹{viewOrder.total?.toLocaleString("en-IN")}</p>

            <div className="space-y-2">
              {(viewOrder.items || []).map((item: any) => (
                <div key={item.id} className="flex justify-between border-b pb-1">
                  <span>{item.name}</span>
                  <span>{item.qty} × ₹{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
