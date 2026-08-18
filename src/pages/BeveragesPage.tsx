import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "../assets/css/product-card.css";
import "../assets/css/foodpage.css";
import PromoBanner from "@/components/PromoBanner";
import Breadcrumb from "@/components/Breadcrumb";
import { useNavigate } from "react-router-dom";

const API = "/products";
const ITEMS_PER_PAGE = 15;

const beverageTabs = [
  "Juices",
  "Sodas",
  "Coffee & Tea",
  "energy drink"
];

/* 🔥 Normalize broken DB */
const normalizeProduct = (p) => ({
  ...p,
  id: p.id,
  name: p.name || p.title,
  price: Number(p.price || 0),
  discountPrice: Number(p.discountPrice || p.oldPrice || p.price || 0),
  image: p.image || p.images?.[0],
  rating: Number(p.rating || 0),
  stock: Number(p.stock || 0),
  category_id: Number(p.category_id || 0),
  category_name: p.category_name || ""
});

export default function BeveragesPage() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [activeType, setActiveType] = useState("");
  const [stockOnly, setStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [ratingFilter, setRatingFilter] = useState(0);

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    api.get(API).then(res => {
      const clean = res.data.map(normalizeProduct);
      setProducts(clean);
    });
  }, []);

  useEffect(() => setPage(1), [activeType, stockOnly, maxPrice, ratingFilter]);

  /* ---------------- FILTER ---------------- */
  const filtered = products.filter(p => {
    const isBeverage =
      p.category_id === 11 || p.category_name.toLowerCase() === "beverage";

    const typeMatch =
      !activeType || p.name.toLowerCase().includes(activeType.toLowerCase());

    const priceMatch = p.discountPrice <= maxPrice;
    const stockMatch = !stockOnly || p.stock > 0;
    const ratingMatch = !ratingFilter || p.rating >= ratingFilter;

    return isBeverage && typeMatch && priceMatch && stockMatch && ratingMatch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const toggleWishlist = id => {
    const updated = wishlist.includes(id)
      ? wishlist.filter(x => x !== id)
      : [...wishlist, id];

    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb />

      <section className="container pb-20">
        <div className="food-layout">

          {/* SIDEBAR */}
          <aside className="filter-sidebar">
            <h3 className="filter-title">Type</h3>

            {beverageTabs.map(tab => (
              <label key={tab} className="filter-item">
                <input
                  type="checkbox"
                  checked={activeType === tab}
                  onChange={() =>
                    setActiveType(activeType === tab ? "" : tab)
                  }
                />
                {tab}
              </label>
            ))}

            <div className="filter-group">
              <h4>Max Price</h4>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={maxPrice}
                onChange={e => setMaxPrice(+e.target.value)}
              />
              <span>Up to ₹{maxPrice}</span>
            </div>

              <div className="filter-group">
              <label className="filter-item">
                <input
                  type="checkbox"
                  checked={stockOnly}
                  onChange={() => {
                    setStockOnly(!stockOnly);
                    setPage(1);
                  }}
                />
                <span>In Stock Only</span>
              </label>
            </div>

            <div className="filter-group">
              <h4>Rating</h4>
              <div className="rating-filter">
                {[4,3,2].map(r => (
                  <button
                    key={r}
                    className={`rating-pill ${ratingFilter === r ? "active" : ""}`}
                    onClick={() => setRatingFilter(r)}
                  >
                    {r} <span>★</span> & above
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* PRODUCTS */}
          <div className="product-grid">
            {paginated.map(p => (
              <div
                key={p.id}
                className="product-card"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <div className="product-img">
                  <button
                    className="product-wish"
                    onClick={e => {
                      e.stopPropagation();
                      toggleWishlist(p.id);
                    }}
                  >
                    {wishlist.includes(p.id) ? "❤️" : "♡"}
                  </button>

                  <img src={p.image} alt={p.name} />

                  {p.stock > 0 && p.stock <= 5 && (
                    <span className="stock-badge low">Only {p.stock} left</span>
                  )}
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
                        className={i <= Math.round(p.rating) ? "star filled" : "star"}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <div className="product-price">
                    <del>₹{p.price}</del>
                    <strong>₹{p.discountPrice}</strong>
                  </div>

                  <button className="product-btn">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* PAGINATION */}
      <div className="pagination-bar">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={page === i + 1 ? "active" : ""}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <PromoBanner page="beverages" />
      <Footer />
    </div>
  );
}
