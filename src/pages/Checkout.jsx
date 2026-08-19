import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, errMsg } from "@/lib/api";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();

  /* ---------------- AUTH ---------------- */
  const { user: authUser, booting } = useAuth();

  useEffect(() => {
    if (!booting && !authUser) navigate("/login");
  }, [booting, authUser, navigate]);

  /* ---------------- STATE ---------------- */
  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState("free");
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [couponMsg, setCouponMsg] = useState(null); // { ok, text }
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [saveAddress, setSaveAddress] = useState(false);

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

  // Saved address book (server-side, follows the account)
  useEffect(() => {
    if (!authUser) return;
    api.get("/addresses").then((res) => {
      setSavedAddresses(res.data);
      const def = res.data.find((a) => a.isDefault);
      if (def) useAddress(def);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const useAddress = (a) => {
    const [firstName, ...rest] = (a.name || "").split(" ");
    setForm((f) => ({
      ...f,
      firstName: firstName || "",
      lastName: rest.join(" "),
      phone: a.phone || "",
      address: a.line1 || "",
      city: a.city || "",
      state: a.state || "",
      zip: a.pincode || "",
    }));
  };

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

  // Coupons are validated by the server (expiry, min order, usage limits) —
  // the preview discount shown here is recomputed authoritatively on order.
  const applyPromo = async () => {
    const code = promo.trim().toUpperCase();
    if (!code) return;
    try {
      const { data } = await api.post("/coupons/validate", {
        code,
        subtotal: totalPrice,
      });
      setDiscount(data.discount);
      setAppliedCode(data.code);
      setCouponMsg({ ok: true, text: `${data.code} applied — ${data.description || `₹${data.discount} off`}` });
      setPromo("");
    } catch (err) {
      setDiscount(0);
      setAppliedCode("");
      setCouponMsg({ ok: false, text: errMsg(err, "Invalid or expired coupon") });
    }
  };

  const removePromo = () => {
    setDiscount(0);
    setAppliedCode("");
    setCouponMsg(null);
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

      // The server owns pricing and stock: we send items as {id, qty} plus
      // the choices that affect fees — it recomputes everything from the DB.
      const { data } = await api.post("/orders", {
        items: cart.map((i) => ({ id: i.id, qty: i.qty })),
        paymentMethod,
        deliveryType: delivery,
        couponCode: appliedCode,
        address: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone,
          line1: form.address,
          city: form.city,
          state: form.state,
          pincode: form.zip,
        },
      });

      const order = data.order;

      // Online payment → complete against the gateway (mock in dev: the same
      // create → pay → verify flow, simulated instantly).
      if (data.payment) {
        await api.post(`/orders/${order.id}/verify-payment`, {
          paymentId: `pay_${data.payment.mode}_${Date.now()}`,
          signature: data.payment.mode === "mock" ? "mock" : "",
        });
      }

      // Optionally save the shipping address to the account's address book.
      if (saveAddress) {
        api.post("/addresses", {
          name: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone,
          line1: form.address,
          city: form.city,
          state: form.state,
          pincode: form.zip,
        }).catch(() => {});
      }

      clearCart();
      sessionStorage.setItem("last_order_id", order.id);
      navigate("/order-success");
    } catch (err) {
      alert(errMsg(err, "Something went wrong. Please try again."));
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

      <section className="w-full px-4 md:px-8 py-12">
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

                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Deliver to a saved address
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {savedAddresses.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => useAddress(a)}
                          className="text-left border rounded-xl px-4 py-3 hover:border-red-500 transition max-w-[240px]"
                        >
                          <span className="text-xs font-semibold text-red-600">
                            {a.label}{a.isDefault ? " · Default" : ""}
                          </span>
                          <p className="text-sm font-medium">{a.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {a.line1}, {a.city} {a.pincode}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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

                {authUser && (
                  <label className="flex items-center gap-2 mt-4 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="accent-red-600"
                    />
                    Save this address to my address book
                  </label>
                )}
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
  {!appliedCode ? (
    <div className="flex gap-2 mt-5">
      <input
        className="border rounded-lg px-3 py-2 flex-1 text-sm"
        placeholder="Coupon code (try FRESH10)"
        value={promo}
        onChange={(e) => setPromo(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && applyPromo()}
      />
      <button
        onClick={applyPromo}
        className="bg-black text-white px-4 rounded-lg text-sm"
      >
        Apply
      </button>
    </div>
  ) : (
    <div className="flex items-center justify-between mt-5 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
      <span className="text-sm font-medium text-green-700">
        {appliedCode} applied
      </span>
      <button
        onClick={removePromo}
        className="text-xs text-red-600 hover:underline"
      >
        Remove
      </button>
    </div>
  )}
  {couponMsg && (
    <p className={`text-xs mt-2 ${couponMsg.ok ? "text-green-600" : "text-red-600"}`}>
      {couponMsg.text}
    </p>
  )}

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
