import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { CheckCircle } from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function OrderSuccess() {
  const navigate = useNavigate();

  const orderId = sessionStorage.getItem("last_order_id");

  // Optional auto redirect after 10 sec
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/orders");
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <Header />

      <Confetti numberOfPieces={250} recycle={false} />

      <section className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />

          <h1 className="text-3xl font-bold mb-2">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-600 mb-4">
            Thank you for shopping with us 🎉
          </p>

          {orderId && (
            <div className="bg-gray-50 border rounded-lg p-3 text-sm mb-6">
              <span className="text-gray-500">Order ID:</span>
              <br />
              <span className="font-semibold">{orderId}</span>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-6">
            Estimated delivery in <b>2–5 business days</b>
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/orders")}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold shadow"
            >
              Track Order
            </button>

            <button
              onClick={() => navigate("/")}
              className="border px-6 py-3 rounded-full hover:bg-gray-50"
            >
              Continue Shopping
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            You will be redirected to orders page shortly…
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
