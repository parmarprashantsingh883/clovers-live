import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const CART_EXPIRY_DAYS = 7;

  /* ---------------- INIT CART WITH EXPIRY ---------------- */
  const [cart, setCart] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cart"));

      if (!stored) return [];

      const now = Date.now();
      const expiryTime = CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      if (now - stored.savedAt > expiryTime) {
        localStorage.removeItem("cart");
        return [];
      }

      return stored.items || [];
    } catch {
      return [];
    }
  });

  /* ---------------- SAVE CART (IMPORTANT) ---------------- */
  useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify({
        items: cart,
        savedAt: Date.now(),
      })
    );
  }, [cart]);

  /* ---------------- ADD TO CART ---------------- */
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);

      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });

    toast.success("Added to Cart", {
      description: `${product.name} is now in your cart`,
      duration: 2800,
    });
  };

  /* ---------------- REMOVE ITEM ---------------- */
  const removeFromCart = (id) => {
    const item = cart.find((p) => p.id === id);

    setCart((prev) => prev.filter((p) => p.id !== id));

    toast.error("Removed from Cart", {
      description: item?.name || "Item removed",
      duration: 2500,
    });
  };

  /* ---------------- CLEAR CART ---------------- */
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");

    toast.error("Cart cleared", {
      duration: 2000,
    });
  };

  /* ---------------- INCREASE QTY ---------------- */
  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, qty: p.qty + 1 } : p
      )
    );
  };

  /* ---------------- DECREASE QTY ---------------- */
  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, qty: p.qty - 1 } : p
        )
        .filter((p) => p.qty > 0)
    );
  };

  /* ---------------- TOTALS ---------------- */
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.qty * (item.discountPrice || item.price),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        increaseQty,
        decreaseQty,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* ---------------- SAFE HOOK ---------------- */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
};
