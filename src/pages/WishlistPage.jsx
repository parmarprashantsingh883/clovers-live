import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";


import "../assets/css/product-card.css";
import "../assets/css/foodpage.css";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb />

      {/* PAGE HEADER */}
      <section className="container py-14 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold">
          Your <span className="text-primary">Wishlist</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Products you saved for later ❤️
        </p>
      </section>

      {/* EMPTY STATE */}
      {wishlist.length === 0 && (
        <section className="container pb-32 text-center">
          <div className="max-w-md mx-auto bg-white rounded-2xl p-10 shadow-soft">
            <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-muted-foreground">
              Save items you like and come back later.
            </p>
          </div>
        </section>
      )}

      {/* WISHLIST GRID */}
      {wishlist.length > 0 && (
        <section className="container pb-24">
          <div className="product-grid">
            {wishlist.map(p => (
              <div className="product-card" key={p.id}>
                <div className="product-img">

                  <button
                    className="product-wish"
                    onClick={() => removeFromWishlist(p.id)}
                  >
                    ❤️
                  </button>

                  <img src={p.image} alt={p.name} />

                  {p.stock === 0 && (
                    <span className="stock-badge out">Out of Stock</span>
                  )}
                </div>

                <div className="product-body">
                  <p className="product-title">{p.name}</p>

                  <div className="product-rating">
                    {[1,2,3,4,5].map(i => (
                      <span
                        key={i}
                        className={i <= Math.round(p.rating || 0)
                          ? "star filled"
                          : "star"}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <div className="product-price">
                    <strong>₹{p.discountPrice || p.price}</strong>
                    {p.discountPrice && <span>₹{p.price}</span>}
                  </div>

                  <div className="wishlist-actions">
  <button
    className="product-btn"
    disabled={p.stock === 0}
    onClick={() => {
      addToCart(p);
      removeFromWishlist(p.id);
    }}
  >
        <ShoppingCart  size={15}/> Move to Cart
  </button>

  <button
    className="wishlist-remove-btn"
    onClick={() => {
      removeFromWishlist(p.id);
      toast.error("Removed from Wishlist", {
        description: p.name,
        duration: 2200
      });
    }}
  >
    Remove
  </button>
</div>

                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
