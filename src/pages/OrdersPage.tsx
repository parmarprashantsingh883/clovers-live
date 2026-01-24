import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";

import { Clock, CheckCircle, Truck } from "lucide-react";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  const authUser = JSON.parse(sessionStorage.getItem("auth_user"));

  useEffect(() => {
    if (!authUser) return;

    axios
      .get("https://clovers-live-production.up.railway.app/orders")
      .then((res) => {
        const userOrders = res.data.filter(
          (order) => String(order.userId) === String(authUser.id)
        );

        setOrders(userOrders.reverse());
      })
      .catch(console.error);
  }, [authUser]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "In Transit":
        return <Truck className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb />

      <section className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {/* EMPTY STATE */}
        {orders.length === 0 && (
          <p className="text-center text-gray-500 py-20">
            You have not placed any orders yet.
          </p>
        )}

        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* LEFT */}
              <div className="flex gap-4 items-center">
                {/* Product Image */}
                <img
                  src={order.items[0]?.image}
                  alt={order.items[0]?.name}
                  className="w-16 h-16 rounded-lg object-cover border"
                />

                <div>
                  <p className="font-semibold">{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {order.items.length} items •{" "}
                    {new Date(order.date).toDateString()}
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>

                <div className="font-semibold text-red-600">
                  ₹{order.total}
                </div>

                <Button
                  variant="outline"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
