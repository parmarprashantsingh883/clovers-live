import { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Heart } from "lucide-react";
import "../assets/css/product-card.css";
import "../assets/css/foodpage.css";
import Breadcrumb from "@/components/Breadcrumb";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/products";
const ITEMS_PER_PAGE = 12;

const categoryTabs = ["Skincare","Hair Care","Body Care","Sun Care"];

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
  subcategory: p.subcategory || "Skincare",
  gender: p.gender || "Unisex"
});

export default function PersonalCarePage() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedCats, setSelectedCats] = useState([]);
  const [stockOnly, setStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [search, setSearch] = useState("");
    const navigate = useNavigate();

  const [gender, setGender] = useState("All");

  const [wishlist, setWishlist] = useState(
    JSON.parse(localStorage.getItem("wishlist") || "[]")
  );

  useEffect(() => {
    axios.get(API).then(res => setProducts(res.data.map(normalize)));
  }, []);

  const toggleWish = id => {
    const updated = wishlist.includes(id)
      ? wishlist.filter(x => x !== id)
      : [...wishlist, id];
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  /* ---------------- FILTER LOGIC ---------------- */
  const filtered = products.filter(p => {
  const isCare =
    Number(p.category_id) === 8 || p.category_name === "Personal Care";

  const sub = (p.subcategory || "Skincare").toString();
  const genderVal = (p.gender || "Unisex").toString();
  const priceVal = Number(p.discountPrice || p.oldPrice || p.price || 0);
  const stockVal = Number(p.stock || 0);
  const ratingVal = Number(p.rating || 0);
 
  const catMatch =
    selectedCats.length === 0 || selectedCats.includes(sub);

  const priceMatch = priceVal <= maxPrice;
  const stockMatch = !stockOnly || stockVal > 0;
  const ratingMatch = !ratingFilter || ratingVal >= ratingFilter;
  const genderMatch = gender === "All" || genderVal === gender;

  return isCare && catMatch && priceMatch && stockMatch && ratingMatch && genderMatch;
});

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
 
      <Breadcrumb />
      <section className="top-filter-bar">
        <div className="pc-search">
  <input
    type="text"
    placeholder="Search skincare, shampoo, lotion..."
    value={search}
    onChange={e => {
      setSearch(e.target.value);
      setPage(1);
    }}
  />
</div>

  <div className="gender-pills">
    {["All","Men","Women","Unisex"].map(g => (
      <button
        key={g}
        className={`gender-pill ${gender === g ? "active" : ""}`}
        onClick={() => {
          setGender(g);
          setPage(1);
        }}
      >
        {g}
      </button>
    ))}
  </div>

 <div className="price-chip premium colored">
  <span>Max Price</span>
  <div>₹{maxPrice}</div>
</div>

</section>


      <section className="container pb-20">
        <div className="food-layout">

          {/* LEFT SIDEBAR FILTERS */}
          <aside className="filter-sidebar">
            <h3 className="filter-title">Category</h3>

            {categoryTabs.map(cat => (
              <label key={cat} className="filter-item">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat)}
                  onChange={() => {
                    setSelectedCats(prev =>
                      prev.includes(cat)
                        ? prev.filter(x => x !== cat)
                        : [...prev, cat]
                    );
                    setPage(1);
                  }}
                />
                {cat}
              </label>
            ))}

            <div className="filter-group">
              <h4>Max Price</h4>
              <input
                type="range"
                min="150"
                max="3000"
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
                    onClick={() => setRatingFilter(r)}
                  >
                    {r} ★ & above
                  </button>
                ))}
              </div>
            </div>

          
          </aside>

          {/* PRODUCTS GRID */}
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

                  <button className="product-btn" disabled={p.stock === 0}>
                    {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
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
     
      <Footer />
    </div>
  );
}
