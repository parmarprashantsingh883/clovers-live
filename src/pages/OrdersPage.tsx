import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";

import { Clock, CheckCircle, Truck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { FALLBACK_IMG } from "@/components/ProductCard";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const { user: authUser, booting } = useAuth() as any;

  useEffect(() => {
    if (booting) return;
    if (!authUser) { navigate("/login"); return; }
    // The server returns only the caller's orders, newest first.
    api.get("/orders").then((res) => setOrders(res.data)).catch(console.error);
  }, [booting, authUser, navigate]);

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

      <section className="w-full px-4 md:px-8 py-10">
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
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }}
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

                <div className="font-semibold text-gray-900">
                  ₹{Math.round(order.total)}
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
