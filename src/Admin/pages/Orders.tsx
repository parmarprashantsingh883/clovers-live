import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
;
import { Eye, Truck, CheckCircle, XCircle } from "lucide-react";

import Modal from "../components/Modal";

const API_ORDERS = "http://localhost:5000/orders";
const API_USERS = "http://localhost:5000/users";
const API_ITEMS = "http://localhost:5000/orderItems";
const API_PRODUCTS = "http://localhost:5000/products";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [viewOrder, setViewOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [o, u, i, p] = await Promise.all([
      axios.get(API_ORDERS),
      axios.get(API_USERS),
      axios.get(API_ITEMS),
      axios.get(API_PRODUCTS)
    ]);
    setOrders(o.data);
    setUsers(u.data);
    setItems(i.data);
    setProducts(p.data);
  };

  const getUser = id => users.find(u => u.id === id);
  const getOrderItems = orderId => items.filter(i => i.order_id === orderId);
  const getProduct = id => products.find(p => p.id === id);

  const filteredOrders = orders.filter(o => {
    const user = getUser(o.user_id);
    return (
      (statusFilter === "all" || o.status === statusFilter) &&
      (
        o.id.toString().includes(search) ||
        user?.name.toLowerCase().includes(search.toLowerCase()) ||
        o.status.toLowerCase().includes(search.toLowerCase())
      )
    );
  });
  const updateStatus = async (order, status) => {
  await axios.put(`http://localhost:5000/orders/${order.id}`, {
    ...order,
    status
  });
  fetchAll();
};

const cancelOrder = async (id) => {
  if (!window.confirm("Cancel this order?")) return;
  await axios.delete(`http://localhost:5000/orders/${id}`);
  fetchAll();
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
            onChange={e => setSearch(e.target.value)}
          />

          <select className="input w-40" onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Placed">Placed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
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
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-right">View</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => {
                const user = getUser(o.user_id);
                const orderItems = getOrderItems(o.id);

                return (
                  <tr key={o.id} className="border-t hover:bg-secondary/30">
                    <td className="p-3">#{o.id}</td>
                    <td className="p-3">{user?.name || "Unknown"}</td>
                    <td className="p-3">
                      {orderItems.reduce((sum, i) => sum + i.quantity, 0)}
                    </td>
                    <td className="p-3 font-semibold">₹{o.total}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{o.date}</td>
                  <td className="p-3 text-right">
  <div className="flex justify-end gap-2">

    <button className="action-btn" title="View Order"
      onClick={() => setViewOrder(o)}>
      <Eye size={18}/>
    </button>

    <button className="action-btn warn"
      title="Mark as Shipped"
      disabled={o.status !== "Placed"}
      onClick={() => updateStatus(o,"Shipped")}>
      <Truck size={18}/>
    </button>

    <button className="action-btn success"
      title="Mark as Delivered"
      disabled={o.status !== "Shipped"}
      onClick={() => updateStatus(o,"Delivered")}>
      <CheckCircle size={18}/>
    </button>

    <button className="action-btn danger"
      title="Cancel Order"
      onClick={() => cancelOrder(o.id)}>
      <XCircle size={18}/>
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
      <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title={`Order #${viewOrder?.id}`}>
        {viewOrder && (
          <div className="space-y-4">

            <p><b>Status:</b></p>
            <select
              className="input"
              value={viewOrder.status}
              onChange={async e => {
                const updated = { ...viewOrder, status: e.target.value };
                await axios.put(`http://localhost:5000/orders/${viewOrder.id}`, updated);
                setViewOrder(updated);
                fetchAll();
              }}
            >
              <option>Placed</option>
              <option>Shipped</option>
              <option>Delivered</option>
            </select>

            <p><b>Total:</b> ₹{viewOrder.total}</p>

            <div className="space-y-2">
              {getOrderItems(viewOrder.id).map(item => {
                const product = getProduct(item.product_id);
                return (
                  <div key={item.id} className="flex justify-between border-b pb-1">
                    <span>{product?.name}</span>
                    <span>{item.quantity} × ₹{item.price}</span>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}
