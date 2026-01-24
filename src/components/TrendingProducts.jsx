import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import "../assets/css/product-card.css";
import "../assets/css/trending.css";

const API = "http://localhost:5000/products";

const TABS = [
  { label: "ALL", value: "all" },
  { label: "FRUITS & VEGES", value: "Fruits & Vegetables" },
  { label: "JUICES", value: "Juices" }
];

function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    axios.get(API)
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts =
    activeTab === "all"
      ? products
      : products.filter(p => p.category_name === activeTab);

  return (
    <section className="container trending-section">
      {/* HEADER */}
      <div className="trending-header">
        <h2><span>Trending</span> Products</h2>

        <div className="trending-tabs">
          {TABS.map(tab => (
            <button
              key={tab.value}
              className={activeTab === tab.value ? "active" : ""}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="product-grid">
        {loading &&
          [...Array(10)].map((_, i) => (
            <div className="product-card skeleton" key={i}></div>
          ))}

        {!loading &&
          filteredProducts.slice(0, 10).map(p => (
            <div className="product-card" key={p.id}>
              <div className="product-img">
                {p.discountPrice && (
                  <span className="stock-badge hot">
                    -
                    {Math.round(
                      ((p.price - p.discountPrice) / p.price) * 100
                    )}
                    %
                  </span>
                )}

               <button
  className={`product-wish ${isInWishlist(p.id) ? "active" : ""}`}
  onClick={(e) => {
    e.stopPropagation();   // 🔥 IMPORTANT
    toggleWishlist(p);
  }}
>
  ♡
</button>


                <img src={p.image} alt={p.name} />
              </div>

              <div className="product-body">
                <p className="product-title">{p.name}</p>

                <div className="product-rating">
                  {[1,2,3,4,5].map(i => (
                    <span
                      key={i}
                      className={i <= Math.round(p.rating || 4) ? "star filled" : "star"}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <div className="product-price">
                  <strong>₹{p.discountPrice || p.price}</strong>
                  {p.discountPrice && <span>₹{p.price}</span>}
                </div>

                <button
                  className="product-btn"
                  onClick={() => addToCart(p)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

export default TrendingProducts;
