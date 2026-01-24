import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
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

  const isInWishlist = (id) => wishlist.some(p => p.id === id);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);

      if (exists) {
        toast.error("Removed from Wishlist", {
          description: product.name,
          duration: 2200
        });
        return prev.filter(p => p.id !== product.id);
      }

      toast.success("Saved to Wishlist ❤️", {
        description: product.name,
        duration: 2500
      });

      return [...prev, product];
    });
  };

  const removeFromWishlist = (id) =>
    setWishlist(prev => prev.filter(p => p.id !== id));

  return (
    <WishlistContext.Provider value={{
      wishlist,
      toggleWishlist,
      removeFromWishlist,
      isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
