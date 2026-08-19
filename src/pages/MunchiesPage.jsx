import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "../assets/css/product-card.css";
import "../assets/css/foodpage.css";
import PromoBanner from "@/components/PromoBanner";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";

const API = "/products?department=Munchies";
const ITEMS_PER_PAGE = 15;

const munchiesTabs = [
  "Chips & Crisps",
  "Chocolates",
  "Cookies & Biscuits",
  "Dry Snacks"
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
  category_name: p.category_name || "",
  subcategory: p.subcategory || ""
});

export default function MunchiesPage() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [activeType, setActiveType] = useState("");
  const [stockOnly, setStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(500);
  const [ratingFilter, setRatingFilter] = useState(0);

  /* FETCH */
  useEffect(() => {
    api.get(API).then(res => {
      const clean = res.data.map(normalizeProduct);
      setProducts(clean);
    });
  }, []);

  useEffect(() => setPage(1), [activeType, stockOnly, maxPrice, ratingFilter]);

  /* FILTER */
  const filtered = products.filter(p => {
    const isMunchies = true; // server already scopes ?department=Munchies

    const typeMatch = !activeType || p.category === activeType;

    const priceMatch = p.price <= maxPrice;
    const stockMatch = !stockOnly || p.stock > 0;
    const ratingMatch = !ratingFilter || p.rating >= ratingFilter;

    return isMunchies && typeMatch && priceMatch && stockMatch && ratingMatch;
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

      <section className="container pb-20">
        <div className="food-layout">

          {/* SIDEBAR */}
          <aside className="filter-sidebar">
            <h3 className="filter-title">Type</h3>

            {munchiesTabs.map(tab => (
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
                min="20"
                max="500"
                step="10"
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
                    {r} ★ & above
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* PRODUCTS */}
          <div className="product-grid">
            {paginated.map(p => (
              <ProductCard p={p} key={p.id} />
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

      <PromoBanner page="munchies" />
      <Footer />
    </div>
  );
}
