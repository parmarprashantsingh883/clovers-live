import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { SearchX } from "lucide-react";
import "../assets/css/product-card.css";
import "../assets/css/foodpage.css";

const SORTS = [
  { value: "", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Reviewed" },
];

const PAGE_SIZE = 20;

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const sort = params.get("sort") || "";
  const page = Number(params.get("page")) || 1;

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: { q, sort: sort || undefined, page, limit: PAGE_SIZE } })
      .then((res) => {
        setProducts(res.data);
        setTotal(Number(res.headers["x-total-count"]) || res.data.length);
      })
      .finally(() => setLoading(false));
  }, [q, sort, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb />

      <section className="container py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold">
              {q ? <>Results for “<span className="text-primary">{q}</span>”</> : "All Products"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {loading ? "Searching…" : `${total} product${total === 1 ? "" : "s"} found`}
            </p>
          </div>

          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="border rounded-lg px-4 py-2 bg-white text-sm"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {!loading && products.length === 0 && (
          <div className="max-w-md mx-auto bg-white rounded-2xl p-10 shadow-soft text-center my-16">
            <SearchX size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try a different keyword or browse our departments.
            </p>
          </div>
        )}

        <div className="product-grid">
          {products.map((p) => (
            <div className="product-card" key={p.id}>
              <div className="product-img" onClick={() => navigate(`/product/${p.id}`)}>
                <button
                  className="product-wish"
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
                >
                  {isInWishlist(p.id) ? "❤️" : "🤍"}
                </button>
                <img src={p.image} alt={p.name} />
                {p.stock === 0 && <span className="stock-badge out">Out of Stock</span>}
              </div>

              <div className="product-body">
                <p className="product-title">{p.name}</p>
                <div className="product-rating">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className={i <= Math.round(p.rating || 0) ? "star filled" : "star"}>★</span>
                  ))}
                  {p.reviews > 0 && <span className="text-xs text-muted-foreground ml-1">({p.reviews})</span>}
                </div>
                <div className="product-price">
                  <strong>₹{p.discountPrice || p.price}</strong>
                  {p.originalPrice && p.originalPrice > p.price && <span>₹{p.originalPrice}</span>}
                </div>
                <button
                  className="product-btn"
                  disabled={p.stock === 0}
                  onClick={() => addToCart(p)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setParam("page", String(n))}
                className={`w-9 h-9 rounded-lg text-sm font-medium border ${
                  n === page ? "bg-primary text-white border-primary" : "bg-white hover:bg-muted"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
