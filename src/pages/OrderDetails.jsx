import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

import { Clock, CheckCircle, Truck, ArrowLeft } from "lucide-react";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Owner-scoped on the server: 403s if it's someone else's order.
    api.get(`/orders/${id}`)
      .then((res) => { setOrder(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const getStatusUI = (status) => {
    switch (status) {
      case "Delivered":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bg: "bg-green-50",
        };
      case "In Transit":
        return {
          icon: Truck,
          color: "text-blue-600",
          bg: "bg-blue-50",
        };
      default:
        return {
          icon: Clock,
          color: "text-orange-600",
          bg: "bg-orange-50",
        };
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="text-center py-32 text-gray-500">
          Loading order details...
        </div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <div className="text-center py-32 text-gray-500">
          Order not found
        </div>
        <Footer />
      </>
    );
  }

  const statusUI = getStatusUI(order.status);
  const StatusIcon = statusUI.icon;
  const address = order.address || {};

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <Breadcrumb />

        <section className="max-w-5xl mx-auto px-6 py-12 space-y-10">

          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to orders
          </button>

          {/* ORDER HEADER */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{order.id}</h1>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.date).toDateString()}
              </p>
            </div>

            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusUI.bg} ${statusUI.color}`}
            >
              <StatusIcon className="w-4 h-4" />
              {order.status}
            </div>
          </div>

          {/* STATUS TIMELINE */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-semibold mb-4">Order Status</h3>

            <div className="flex items-center justify-between text-sm">
              {["Processing", "In Transit", "Delivered"].map((step, i) => {
                const active =
                  ["Processing", "In Transit", "Delivered"].indexOf(order.status) >= i;

                return (
                  <div key={step} className="flex-1 flex items-center">
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                        active
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {i + 1}
                    </div>

                    <span
                      className={`ml-2 ${
                        active ? "text-black font-medium" : "text-gray-400"
                      }`}
                    >
                      {step}
                    </span>

                    {i < 2 && (
                      <div
                        className={`flex-1 h-1 mx-3 ${
                          active ? "bg-green-400" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ITEMS */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold mb-6">Items in this order</h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border bg-white"
                  />

                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.qty}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-400">Item total</p>
                    <p className="font-bold text-red-600 text-lg">
                      ₹{item.qty * (item.discountPrice || item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ADDRESS + PAYMENT */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow p-6 space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                📍 Delivery Address
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {address.firstName} {address.lastName}
                <br />
                {address.address}
                <br />
                {address.city}, {address.state} – {address.zip}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                💳 Payment Method
              </h3>
              <p className="text-sm capitalize">
                {order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : order.paymentMethod === "upi"
                  ? "UPI Payment"
                  : "Card Payment"}
              </p>
            </div>
          </div>

          {/* PRICE DETAILS */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-2">
            <h3 className="font-semibold mb-4">Price Details</h3>

            <PriceRow label="Subtotal" value={order.charges?.subtotal} />
            <PriceRow
              label="Discount"
              value={order.charges?.discount}
              highlight
            />
            <PriceRow label="Delivery" value={order.charges?.delivery} />
            <PriceRow label="COD Charges" value={order.charges?.codFee} />
            <PriceRow
              label="Convenience Fee"
              value={order.charges?.convenienceFee}
            />
            <PriceRow label="GST" value={order.charges?.gst} />

            <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-red-600">₹{order.total}</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ---------- Price Row ---------- */
function PriceRow({ label, value, highlight = false }) {
  if (value === undefined || value === null || value === 0) return null;

  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-gray-600">{label}</span>
      <span className={highlight ? "text-green-600 font-medium" : ""}>
        ₹{value}
      </span>
    </div>
  );
}
