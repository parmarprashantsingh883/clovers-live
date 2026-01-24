import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import "../assets/css/product-card.css";
import "../assets/css/best-selling.css";

const API = "http://localhost:5000/products";

export default function BestSelling() {
  const [products, setProducts] = useState([]);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    axios.get(API).then(res => {
      setProducts(res.data.slice(0, 12));
    });
  }, []);

  const scroll = dir => {
    sliderRef.current.scrollBy({
      left: dir === "left" ? -420 : 420,
      behavior: "smooth"
    });
  };

  return (
    <section className="container best-selling">
      {/* HEADER */}
      <div className="best-header ">
        <h2 className="my-3">Best  <span>selling</span> products</h2>

        <div className="best-nav">
          <span>View All Categories →</span>
          <button onClick={() => scroll("left")}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll("right")}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* SLIDER */}
      <div className="best-slider" ref={sliderRef}>
        {products.map(p => (
          <div
            key={p.id}
            className="product-card best-slide-card"
            onClick={() => navigate(`/product/${p.id}`)}
          >
            {/* IMAGE */}
            <div className="product-img">
              <button
                className="product-wish"
                onClick={e => {
                  e.stopPropagation();
                  toggleWishlist(p);
                }}
              >
                {isInWishlist(p.id) ? "❤️" : "♡"}
              </button>

              <img src={p.image} alt={p.name} />

              {p.stock > 0 && p.stock <= 5 && (
                <span className="stock-badge low">
                  Only {p.stock} left
                </span>
              )}
              {p.stock === 0 && (
                <span className="stock-badge out">
                  Out of Stock
                </span>
              )}
            </div>

            {/* BODY */}
            <div className="product-body">
              <p className="product-title">{p.name}</p>

              <div className="product-rating">
                {[1,2,3,4,5].map(i => (
                  <span
                    key={i}
                    className={
                      i <= Math.round(p.rating || 0)
                        ? "star filled"
                        : "star"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>

              <div className="product-price">
                {p.discountPrice && <del>₹{p.price}</del>}
                <strong>₹{p.discountPrice || p.price}</strong>
              </div>

              <button
                className="product-btn"
                disabled={p.stock === 0}
                onClick={e => {
                  e.stopPropagation();
                  addToCart(p);
                }}
              >
                {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
