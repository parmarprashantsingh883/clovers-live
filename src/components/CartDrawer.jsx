import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2, ShoppingBag, ChevronRight, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";

const FREE_DELIVERY_AT = 499;
const DELIVERY_FEE = 30;

/** Blinkit-style slide-in cart: free-delivery progress, steppers, bill detail. */
export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { cart, increaseQty, decreaseQty, removeFromCart, totalPrice, totalItems } = useCart();

  // lock page scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const savings = cart.reduce(
    (s, i) => s + (i.originalPrice && i.originalPrice > i.price ? (i.originalPrice - i.price) * i.qty : 0),
    0
  );
  const delivery = totalPrice >= FREE_DELIVERY_AT || cart.length === 0 ? 0 : DELIVERY_FEE;
  const toFree = FREE_DELIVERY_AT - totalPrice;
  const progress = Math.min(100, Math.round((totalPrice / FREE_DELIVERY_AT) * 100));

  return (
    <>
      {/* overlay */}
      <div
        className={`fixed inset-0 z-[80] bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* panel */}
      <aside
        className={`fixed top-0 right-0 z-[90] h-full w-full max-w-[400px] bg-[#f5f6f8] flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        {/* header */}
        <div className="flex items-center justify-between bg-white px-4 py-3.5 shadow-sm">
          <h3 className="font-bold text-[15px]">My Cart {totalItems > 0 && `(${totalItems})`}</h3>
          <button onClick={onClose} aria-label="Close cart" className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
            <ShoppingBag size={44} className="text-gray-300" />
            <p className="font-semibold text-gray-700">Your cart is empty</p>
            <p className="text-sm text-gray-500">Add products to get started.</p>
            <button
              onClick={onClose}
              className="mt-2 bg-green-600 text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-green-700"
            >
              Browse products
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {/* delivery promise + free-delivery progress */}
              <div className="bg-white rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-800">
                  <Zap size={15} className="text-green-600" />
                  Delivery in 10 minutes
                </div>
                {toFree > 0 ? (
                  <>
                    <p className="text-xs text-gray-500 mt-2">
                      Add <b className="text-gray-800">₹{toFree}</b> more for <b className="text-green-600">FREE delivery</b>
                    </p>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-green-600 font-semibold mt-2">🎉 You've unlocked FREE delivery</p>
                )}
              </div>

              {/* items */}
              <div className="bg-white rounded-xl divide-y">
                {cart.map((i) => (
                  <div key={i.id} className="flex items-center gap-3 p-3">
                    <img
                      src={i.image}
                      alt={i.name}
                      className="w-14 h-14 rounded-lg object-contain border bg-white shrink-0"
                      onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium leading-snug line-clamp-2">{i.name}</p>
                      {i.weight && <p className="text-[11px] text-gray-400">{i.weight}</p>}
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-[13px] font-bold">₹{i.price * i.qty}</span>
                        {i.originalPrice > i.price && (
                          <del className="text-[11px] text-gray-400">₹{i.originalPrice * i.qty}</del>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center bg-green-600 text-white rounded-lg overflow-hidden">
                        <button className="w-7 h-7 flex items-center justify-center hover:bg-white/15" aria-label="Decrease" onClick={() => decreaseQty(i.id)}>
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-[13px] font-bold">{i.qty}</span>
                        <button className="w-7 h-7 flex items-center justify-center hover:bg-white/15" aria-label="Increase" onClick={() => increaseQty(i.id)}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <button className="text-gray-300 hover:text-red-500" aria-label="Remove" onClick={() => removeFromCart(i.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* bill details */}
              <div className="bg-white rounded-xl p-3.5 text-[13px] space-y-1.5">
                <p className="font-bold text-gray-800 mb-1">Bill details</p>
                <div className="flex justify-between text-gray-600">
                  <span>Items total {savings > 0 && <em className="not-italic text-[11px] bg-blue-50 text-blue-600 font-semibold px-1.5 py-0.5 rounded ml-1">saved ₹{savings}</em>}</span>
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
                <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t mt-1.5">
                  <span>Grand total</span>
                  <span>₹{totalPrice + delivery}</span>
                </div>
                <p className="text-[11px] text-gray-400 pt-0.5">Taxes & fees calculated at checkout</p>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,.06)]">
              <button
                onClick={() => { onClose(); navigate("/checkout"); }}
                className="w-full flex items-center justify-between bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-3 transition-colors"
              >
                <span className="text-left leading-tight">
                  <b className="block text-[15px]">₹{totalPrice + delivery}</b>
                  <em className="not-italic text-[11px] opacity-90">TOTAL</em>
                </span>
                <span className="flex items-center gap-1 font-bold text-[14px]">
                  Proceed to Checkout <ChevronRight size={17} />
                </span>
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
