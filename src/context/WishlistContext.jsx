import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const WishlistContext = createContext(null);

/**
 * Wishlist keeps full product objects locally (pages render straight from it)
 * and syncs the id set with the server whenever a user is signed in — so it
 * follows the account across devices instead of living in one browser.
 */
export const WishlistProvider = ({ children }) => {
  const { user } = useAuth() || {};

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // On sign-in: pull the server wishlist (source of truth) and merge in any
  // guest-saved items the account doesn't have yet.
  useEffect(() => {
    if (!user || user.role === "admin") return;
    let cancelled = false;

    (async () => {
      try {
        const { data: serverItems } = await api.get("/wishlist");
        const serverIds = new Set(serverItems.map((p) => p.id));
        const guestOnly = (JSON.parse(localStorage.getItem("wishlist")) || []).filter(
          (p) => !serverIds.has(p.id)
        );
        for (const p of guestOnly) {
          await api.post("/wishlist/toggle", { productId: p.id }).catch(() => {});
        }
        if (!cancelled) setWishlist([...serverItems, ...guestOnly]);
      } catch {
        /* stay on local copy if the sync fails */
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  const isInWishlist = (id) => wishlist.some((p) => p.id === id);

  const syncToggle = (productId) => {
    if (!user || user.role === "admin") return;
    api.post("/wishlist/toggle", { productId }).catch(() => {});
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);

      if (exists) {
        toast.error("Removed from Wishlist", {
          description: product.name,
          duration: 2200,
        });
        return prev.filter((p) => p.id !== product.id);
      }

      toast.success("Saved to Wishlist ❤️", {
        description: product.name,
        duration: 2500,
      });

      return [...prev, product];
    });
    syncToggle(product.id);
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((p) => p.id !== id));
    syncToggle(id);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggleWishlist, removeFromWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
