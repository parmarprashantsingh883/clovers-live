import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { useWishlist } from "@/context/WishlistContext";
import { Heart } from "lucide-react";
import ProductCard from "@/components/ProductCard";


import "../assets/css/product-card.css";
import "../assets/css/foodpage.css";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

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
              <ProductCard p={p} key={p.id} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
