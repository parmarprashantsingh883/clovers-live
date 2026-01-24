import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useCart } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();

  /* ---------------- AUTH ---------------- */
  const authUser = JSON.parse(sessionStorage.getItem("auth_user"));


  useEffect(() => {
    if (!authUser) navigate("/login");
  }, [authUser, navigate]);

  /* ---------------- STATE ---------------- */
  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState("free");
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  /* ---------------- PRICING LOGIC ---------------- */

  // Delivery
  const deliveryCost =
    totalPrice >= 499
      ? 0
      : delivery === "express"
      ? 99
      : delivery === "standard"
      ? 49
      : 0;

  // COD fee
  const codFee = paymentMethod === "cod" ? 30 : 0;

  // Convenience fee
  const convenienceFee = 9;

  // GST (5%)
  const gst = Math.round((totalPrice - discount) * 0.05);

  const grandTotal =
    totalPrice -
    discount +
    deliveryCost +
    codFee +
    convenienceFee +
    gst;

  const totalSavings = discount + (totalPrice >= 499 ? 49 : 0);

  const formatPrice = (p) =>
    p.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });

  /* ---------------- COUPON ---------------- */

  const applyPromo = () => {
    if (promo.toUpperCase() === "FRESH10" && totalPrice >= 299) {
      setDiscount(Math.round(totalPrice * 0.1));
      setCouponApplied(true);
      setPromo("");
    } else {
      alert("Invalid or expired coupon");
    }
  };

  /* ---------------- PLACE ORDER ---------------- */

  const placeOrder = async () => {
    try {
      if (cart.length === 0) return;

      if (paymentMethod === "upi" && !upiId) {
        alert("Enter valid UPI ID");
        return;
      }

      if (
        paymentMethod === "card" &&
        (!card.number || !card.name || !card.expiry || !card.cvv)
      ) {
        alert("Enter complete card details");
        return;
      }

      const order = {
        id: `ORD-${Date.now()}`,
        userId: authUser.id,
        date: new Date().toISOString(),
        status: "Processing",
        paymentMethod,
        charges: {
          subtotal: totalPrice,
          discount,
          delivery: deliveryCost,
          codFee,
          convenienceFee,
          gst,
        },
        total: grandTotal,
        address: form,
        items: cart,
      };

      await axios.post("http://localhost:5000/orders", order);

      clearCart();
     // 👇 ADD THESE TWO LINES
  sessionStorage.setItem("last_order_id", order.id);
  navigate("/order-success");
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
  };

  /*    dilvery date logic*/
  const getDeliveryDate = () => {
  const days =
    delivery === "express" ? 1 : delivery === "standard" ? 3 : 6;

  const date = new Date();
  date.setDate(date.getDate() + days);

  return date.toDateString();
};

  /* ---------------- UI ---------------- */

  return (
    <>
      <Header />
      <Breadcrumb />

      <section className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Secure Checkout</h1>
        <p className="text-gray-500 mb-10">
          Almost there! Review and place your order.
        </p>

        {/* STEPPER */}
        <div className="flex items-center justify-between mb-12">
          {["Shipping", "Payment", "Review"].map((label, i) => (
            <div key={i} className="flex-1 flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold
                ${
                  step >= i + 1
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`ml-3 font-medium ${
                  step >= i + 1 ? "text-black" : "text-gray-400"
                }`}
              >
                {label}
              </span>
              {i < 2 && (
                <div
                  className={`flex-1 h-[2px] mx-4 ${
                    step > i + 1 ? "bg-red-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow">
            {step === 1 && (
              <>
                <h3 className="text-xl font-semibold mb-6">
                  Delivery Address
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(form).map((key) => (
                    <input
                      key={key}
                      className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                      placeholder={key}
                      value={form[key]}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                    />
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-xl font-semibold mb-6">
                  Payment Method
                </h3>

                {["upi", "card", "cod"].map((m) => (
                  <div
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`p-4 rounded-xl border cursor-pointer mb-3 transition
                    ${
                      paymentMethod === m
                        ? "border-red-600 bg-red-50"
                        : "hover:border-gray-400"
                    }`}
                  >
                    {m.toUpperCase()}
                    {m === "cod" && (
                      <span className="text-sm text-gray-500 ml-2">
                        (+₹30)
                      </span>
                    )}
                  </div>
                ))}
              </>
            )}

           {step === 3 && (
  <div className="space-y-6">
    <h3 className="text-2xl font-semibold">Review & Confirm</h3>

    {/* ADDRESS */}
    <div className="bg-gray-50 rounded-xl p-5 border">
      <h4 className="font-semibold mb-2">📦 Delivery Address</h4>
      <p className="text-sm text-gray-700 leading-relaxed">
        {form.firstName} {form.lastName}
        <br />
        {form.address}
        <br />
        {form.city}, {form.state} - {form.zip}
      </p>
      <button
        className="text-red-600 text-sm mt-2 hover:underline"
        onClick={() => setStep(1)}
      >
        Edit address
      </button>
    </div>

    {/* PAYMENT */}
    <div className="bg-gray-50 rounded-xl p-5 border">
      <h4 className="font-semibold mb-2">💳 Payment Method</h4>
      <p className="text-sm text-gray-700 capitalize">
        {paymentMethod === "cod"
          ? "Cash on Delivery"
          : paymentMethod === "upi"
          ? "UPI Payment"
          : "Card Payment"}
      </p>
      <button
        className="text-red-600 text-sm mt-2 hover:underline"
        onClick={() => setStep(2)}
      >
        Change payment method
      </button>
    </div>

    {/* ITEMS */}
    <div className="bg-white rounded-xl border p-5">
      <h4 className="font-semibold mb-4">🛒 Items in your order</h4>

      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border-b pb-3 last:border-b-0"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-14 h-14 rounded-lg object-cover border"
            />

            <div className="flex-1">
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-gray-500">
                Qty: {item.qty}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Estimated delivery by{" "}
                <span className="font-medium">
                  {getDeliveryDate()}
                </span>
              </p>
            </div>

            <p className="font-semibold text-red-600 text-sm">
              {formatPrice(item.qty * (item.discountPrice || item.price))}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* TRUST MESSAGE */}
    <div className="text-xs text-gray-500 bg-green-50 border border-green-200 rounded-lg p-3">
      ✅ You can cancel this order anytime before it is dispatched.
    </div>
  </div>
)}


            <div className="flex justify-between mt-10">
              {step > 1 && (
                <button
                  className="border px-6 py-2 rounded"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </button>
              )}
              <button
                disabled={cart.length === 0}
                className="bg-red-600 text-white px-10 py-4 rounded-full font-semibold shadow hover:bg-red-700 transition disabled:opacity-50"
                onClick={() =>
                  step < 3 ? setStep(step + 1) : placeOrder()
                }
              >
                {step === 3 ? "Place Order" : "Continue"}
              </button>
            </div>
          </div>

          {/* RIGHT */}
       <aside className="bg-white p-6 rounded-2xl shadow-lg sticky top-24">
  <h3 className="font-semibold mb-4">Order Summary</h3>

  {/* PRODUCTS */}
  <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
    {cart.map((item) => (
      <div key={item.id} className="flex gap-3 items-center">
        <img
          src={item.image}
          alt={item.name}
          className="w-14 h-14 rounded-lg object-cover border"
        />

        <div className="flex-1">
          <p className="text-sm font-medium leading-tight">
            {item.name}
          </p>
          <p className="text-xs text-gray-500">
            Qty: {item.qty}
          </p>
        </div>

        <p className="text-sm font-semibold text-red-600">
          {formatPrice(item.qty * (item.discountPrice || item.price))}
        </p>
      </div>
    ))}
  </div>

  {/* COUPON */}
  <div className="flex gap-2 mt-5">
    <input
      className="border rounded-lg px-3 py-2 flex-1 text-sm"
      placeholder="Coupon code"
      value={promo}
      onChange={(e) => setPromo(e.target.value)}
    />
    <button
      onClick={applyPromo}
      className="bg-black text-white px-4 rounded-lg text-sm"
    >
      Apply
    </button>
  </div>

  {/* PRICE BREAKUP */}
  <div className="text-sm space-y-2 border-t mt-5 pt-4">
    <Row label="Subtotal" value={formatPrice(totalPrice)} />

    {discount > 0 && (
      <Row
        label="Coupon Discount"
        value={`- ${formatPrice(discount)}`}
        highlight
      />
    )}

    <Row
      label="Delivery"
      value={deliveryCost === 0 ? "FREE" : formatPrice(deliveryCost)}
    />

    {codFee > 0 && (
      <Row label="COD Charges" value={formatPrice(codFee)} />
    )}

    <Row label="Convenience Fee" value={formatPrice(convenienceFee)} />
    <Row label="GST (5%)" value={formatPrice(gst)} />
  </div>

  {/* TOTAL */}
  <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
    <span>Total</span>
    <span className="text-red-600">
      {formatPrice(grandTotal)}
    </span>
  </div>

  {/* SAVINGS */}
  {totalSavings > 0 && (
    <p className="text-green-600 text-sm mt-3">
      🎉 You saved {formatPrice(totalSavings)} on this order
    </p>
  )}
</aside>

        </div>
      </section>

      <Footer />
    </>
  );
}

/* ---------- Small Row Component ---------- */
function Row({ label, value, highlight }) {
  return (
    <div
      className={`flex justify-between ${
        highlight ? "text-green-600 font-medium" : ""
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
