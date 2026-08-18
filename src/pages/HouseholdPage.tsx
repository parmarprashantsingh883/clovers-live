import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Heart } from "lucide-react";
import "../assets/css/product-card.css";
import "../assets/css/foodpage.css";
import { useNavigate } from "react-router-dom";

const API = "/products";
const ITEMS_PER_PAGE = 15;

/* Household sub categories (optional – auto fallback if not present) */
const householdTabs = [
  "All",
  "Cleaning",
  "Laundry",
  "Kitchen",
  "Bathroom",
  "Home Utility"
];

/* Normalize to avoid admin/API mismatch */
const normalize = p => ({
  id: p.id,
  name: p.name || p.title,
  price: Number(p.price || 0),
  discountPrice: Number(p.discountPrice || p.oldPrice || p.price || 0),
  image: p.image || p.images?.[0],
  rating: Number(p.rating || 0),
  stock: Number(p.stock || 0),
  category_id: Number(p.category_id || 0),
  category_name: p.category_name || "",
  subcategory: p.subcategory || "General"
});

export default function HouseholdPage() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);

  const [activeCat, setActiveCat] = useState("All");
  const [stockOnly, setStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [search, setSearch] = useState("");

  const [wishlist, setWishlist] = useState(
    JSON.parse(localStorage.getItem("wishlist") || "[]")
  );

  useEffect(() => {
    api.get(API).then(res =>
      setProducts(res.data.map(normalize))
    );
  }, []);

  const toggleWish = id => {
    const updated = wishlist.includes(id)
      ? wishlist.filter(x => x !== id)
      : [...wishlist, id];

    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };
   const navigate=useNavigate()

  /* ================= FILTER LOGIC ================= */
  const filtered = products.filter(p => {
    const isHousehold =
      p.category_id === 9 ||
      p.category_name === "Household Essentials";

    if (!isHousehold) return false;

    const priceMatch = p.discountPrice <= maxPrice;
    const stockMatch = !stockOnly || p.stock > 0;
    const ratingMatch = !ratingFilter || p.rating >= ratingFilter;
    const catMatch =
      activeCat === "All" || p.subcategory === activeCat;

    const searchMatch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase());

    return priceMatch && stockMatch && ratingMatch && catMatch && searchMatch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb />

      {/* TOP FILTER BAR */}
      <section className="top-filter-bar">
        <div className="pc-search">
          <input
            type="text"
            placeholder="Search cleaners, detergents..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
<div className="price-chip premium colored">
  <span>Max Price</span>
  <div>₹{maxPrice}</div>
</div>


      </section>

      <section className="container pb-20">
        <div className="food-layout">

          {/* ================= SIDEBAR ================= */}
          <aside className="filter-sidebar">
            <h3 className="filter-title">Category</h3>

            {householdTabs.map(cat => (
              <label key={cat} className="filter-item">
                <input
                  type="radio"
                  checked={activeCat === cat}
                  onChange={() => {
                    setActiveCat(cat);
                    setPage(1);
                  }}
                />
                <span>{cat}</span>
              </label>
            ))}

            <div className="filter-group">
              <h4>Max Price</h4>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={e => {
                  setMaxPrice(+e.target.value);
                  setPage(1);
                }}
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
                    onClick={() => {
                      setRatingFilter(r);
                      setPage(1);
                    }}
                  >
                    {r} ★ & above
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ================= PRODUCTS ================= */}
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
                      toggleWish(p.id);
                    }}
                  >
                    {wishlist.includes(p.id) ? "❤️" : "♡"}
                  </button>

                  {p.stock === 0 && (
                    <span className="stock-badge out">Out of Stock</span>
                  )}
                  {p.stock > 0 && p.stock <= 5 && (
                    <span className="stock-badge low">
                      Only {p.stock} left
                    </span>
                  )}

                  <img src={p.image} alt={p.name} />
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

                  <button
                    className="product-btn"
                    disabled={p.stock === 0}
                  >
                    {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
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
      )}

      <Footer />
    </div>
  );
}
