import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { useCart } from "@/context/CartContext";
import { FALLBACK_IMG } from "@/components/ProductCard";
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight, Zap } from "lucide-react";

const FREE_DELIVERY_AT = 499;
const DELIVERY_FEE = 30;

/** Full-page cart — same rules and math as the cart drawer. */
export default function CartPage() {
  const navigate = useNavigate();
  const { cart, increaseQty, decreaseQty, removeFromCart, clearCart, totalPrice, totalItems } = useCart();

  const savings = cart.reduce(
    (s, i) => s + (i.originalPrice && i.originalPrice > i.price ? (i.originalPrice - i.price) * i.qty : 0),
    0
  );
  const delivery = totalPrice >= FREE_DELIVERY_AT || cart.length === 0 ? 0 : DELIVERY_FEE;
  const toFree = FREE_DELIVERY_AT - totalPrice;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb />

      <section className="w-full px-4 md:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">
          My Cart {totalItems > 0 && <span className="text-gray-400 font-medium text-lg">({totalItems} item{totalItems > 1 ? "s" : ""})</span>}
        </h1>

        {cart.length === 0 ? (
          <div className="max-w-md mx-auto bg-white rounded-2xl border p-10 text-center my-12">
            <ShoppingBag size={44} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Your cart is empty</h3>
            <p className="text-sm text-gray-500 mb-5">Add products to get started.</p>
            <button
              onClick={() => navigate("/")}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg"
            >
              Browse products
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* ITEMS */}
            <div className="lg:col-span-2 space-y-3">
              {toFree > 0 ? (
                <div className="bg-white rounded-xl border p-3.5 flex items-center gap-2 text-[13px]">
                  <Zap size={15} className="text-green-600 shrink-0" />
                  <span>
                    Add <b>₹{toFree}</b> more for <b className="text-green-600">FREE delivery</b>
                  </span>
                </div>
              ) : (
                <div className="bg-white rounded-xl border p-3.5 flex items-center gap-2 text-[13px] text-green-700 font-semibold">
                  <Zap size={15} /> You've unlocked FREE delivery
                </div>
              )}

              <div className="bg-white rounded-2xl border divide-y">
                {cart.map((i) => (
                  <div key={i.id} className="flex items-center gap-4 p-4">
                    <img
                      src={i.image || FALLBACK_IMG}
                      alt={i.name}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                      className="w-16 h-16 rounded-xl object-contain border bg-white shrink-0 cursor-pointer"
                      onClick={() => navigate(`/product/${i.id}`)}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium leading-snug line-clamp-2 cursor-pointer hover:text-green-700"
                        onClick={() => navigate(`/product/${i.id}`)}
                      >
                        {i.name}
                      </p>
                      {i.weight && <p className="text-xs text-gray-400">{i.weight}</p>}
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-bold">₹{i.price * i.qty}</span>
                        {i.originalPrice > i.price && (
                          <del className="text-xs text-gray-400">₹{i.originalPrice * i.qty}</del>
                        )}
                        <span className="text-xs text-gray-400">₹{i.price} each</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center bg-green-600 text-white rounded-lg overflow-hidden">
                        <button className="w-8 h-8 flex items-center justify-center hover:bg-white/15" aria-label="Decrease" onClick={() => decreaseQty(i.id)}>
                          <Minus size={13} />
                        </button>
                        <span className="w-7 text-center text-sm font-bold">{i.qty}</span>
                        <button className="w-8 h-8 flex items-center justify-center hover:bg-white/15" aria-label="Increase" onClick={() => increaseQty(i.id)}>
                          <Plus size={13} />
                        </button>
                      </div>
                      <button className="text-gray-300 hover:text-red-500" aria-label="Remove item" onClick={() => removeFromCart(i.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={clearCart} className="text-xs text-gray-400 hover:text-red-500 px-1">
                Clear cart
              </button>
            </div>

            {/* BILL */}
            <aside className="bg-white rounded-2xl border p-5 sticky top-28">
              <h3 className="font-bold text-[15px] mb-3">Bill details</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Items total
                    {savings > 0 && (
                      <em className="not-italic text-[11px] bg-blue-50 text-blue-600 font-semibold px-1.5 py-0.5 rounded ml-1.5">
                        saved ₹{savings}
                      </em>
                    )}
                  </span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery charge</span>
                  {delivery === 0 ? (
                    <span><del className="text-gray-400 mr-1">₹{DELIVERY_FEE}</del><b className="text-green-600">FREE</b></span>
                  ) : (
                    <span>₹{delivery}</span>
                  )}
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t pt-2.5 mt-2.5">
                  <span>Grand total</span>
                  <span>₹{totalPrice + delivery}</span>
                </div>
                <p className="text-[11px] text-gray-400">Taxes & fees calculated at checkout</p>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="mt-4 w-full flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-bold text-sm transition-colors"
              >
                Proceed to Checkout <ChevronRight size={16} />
              </button>
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
