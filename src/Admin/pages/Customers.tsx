import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { Search, Pencil, Trash2 } from "lucide-react";

const USERS_API = "http://localhost:5000/users";
const ORDERS_API = "http://localhost:5000/orders";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const users = await axios.get(USERS_API);
    const orders = await axios.get(ORDERS_API);

    const enriched = users.data.map(u => {
      const userOrders = orders.data.filter(o => o.user_id === u.id);
      return {
        ...u,
        orders: userOrders.length,
        spent: "$" + userOrders.reduce((s,o)=>s+o.total,0).toFixed(2),
        joined: "2024",
        status: "Active"
      };
    });

    setCustomers(enriched);
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Header title="Customers" subtitle="Manage your customer base" />

      <div className="p-6 space-y-6">

        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search customers..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
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
              {filtered.map(c=>(
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-500">
                      {c.name.split(" ").map(n=>n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-gray-500">{c.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-center">{c.orders}</td>
                  <td className="p-4 text-center font-semibold">{c.spent}</td>
                  <td className="p-4 text-center">
                   <span
  className={`px-3 py-1 rounded-full text-xs font-medium
    ${c.status === "Active" && "bg-green-100 text-green-600"}
    ${c.status === "Inactive" && "bg-yellow-100 text-yellow-600"}
    ${c.status === "Suspended" && "bg-red-100 text-red-600"}
  `}
>
  {c.status}
</span>

                  </td>
                  <td className="p-4 text-center">{c.joined}</td>
                  <td className="p-4 text-right flex justify-end gap-3">
                    <button onClick={()=>setEditingCustomer(c)}>
                      <Pencil size={16}/>
                    </button>
                    <button onClick={()=>setDeletingCustomer(c)}>
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* EDIT MODAL */}
     <Modal
  isOpen={!!editingCustomer}
  onClose={() => setEditingCustomer(null)}
  title="Edit Customer"
>
  <div className="space-y-4">

    <div>
      <label className="block text-sm font-medium mb-1">Name</label>
      <input
        type="text"
        value={editingCustomer?.name || ""}
        onChange={e =>
          setEditingCustomer({ ...editingCustomer, name: e.target.value })
        }
        className="w-full h-11 px-4 border rounded-xl"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Email</label>
      <input
        type="email"
        value={editingCustomer?.email || ""}
        onChange={e =>
          setEditingCustomer({ ...editingCustomer, email: e.target.value })
        }
        className="w-full h-11 px-4 border rounded-xl"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Status</label>
      <select
  value={editingCustomer?.status || "Active"}
  onChange={e =>
    setEditingCustomer({ ...editingCustomer, status: e.target.value })
  }
  className={`w-full h-11 px-4 border rounded-xl
    ${editingCustomer?.status === "Suspended" && "text-red-600 border-red-300"}
  `}
>

        <option>Active</option>
        <option>Inactive</option>
        <option>Suspended</option>
      </select>
    </div>

    <div className="flex justify-end gap-3 pt-4">
      <button
        onClick={() => setEditingCustomer(null)}
        className="px-6 py-2 border rounded-xl"
      >
        Cancel
      </button>
      <button
        onClick={() => {
          setCustomers(customers.map(c =>
            c.id === editingCustomer.id ? editingCustomer : c
          ));
          setEditingCustomer(null);
        }}
        className="px-6 py-2 bg-red-600 text-white rounded-xl"
      >
        Save Changes
      </button>
    </div>
  </div>
</Modal>


      {/* DELETE MODAL */}
      <Modal isOpen={!!deletingCustomer} onClose={()=>setDeletingCustomer(null)} title="Delete Customer">
        <p>Delete <b>{deletingCustomer?.name}</b>?</p>
        <button
          className="btn bg-red-500 mt-3"
          onClick={()=>{
            setCustomers(customers.filter(x=>x.id!==deletingCustomer.id));
            setDeletingCustomer(null);
          }}
        >
          Delete
        </button>
      </Modal>

    </div>
  );
}
