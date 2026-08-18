import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "../assets/css/product-card.css";
import "../assets/css/foodpage.css";
import PromoBanner from "@/components/PromoBanner";
import Breadcrumb from "@/components/Breadcrumb";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";




const API = "/products";
const ITEMS_PER_PAGE = 15;

const categoryTabs = [
  "Fresh Fruits",
  "Vegetables",
  "Dairy & Eggs",
  "Snacks",
  "Bakery",
  "Meat & Seafood",
  "Frozen Foods"
];

export default function FoodPage() {
  const { addToCart } = useCart();
const { toggleWishlist, isInWishlist } = useWishlist();



  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedCats, setSelectedCats] = useState([]);
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
    api.get(API).then(res => setProducts(res.data));
  }, []);

  /* ---------------- FILTER LOGIC ---------------- */
  const filtered = products.filter(p => {
    if (!p.name || !p.price) return false;

    const catMatch =
      selectedCats.length === 0 || selectedCats.includes(p.category_name);

    const priceMatch = (p.discountPrice || p.price) <= maxPrice;
    const stockMatch = !stockOnly || p.stock > 0;
    const ratingMatch = !ratingFilter || p.rating >= ratingFilter;

    return catMatch && priceMatch && stockMatch && ratingMatch;
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

{/* promo */} 
<section className="container promo-strip">
  <div className="promo-banner green">
    <div className="promo-content">
      <span className="promo-tag">UP TO 30% OFF</span>
      <h2>Freshly <br /> Launched</h2>
      <p>Farm fresh fruits & vegetables delivered to your door.</p>
      <button>Explore</button>
    </div>
    <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=900" />
  </div>

  <div className="promo-banner peach">
    <div className="promo-content">
      <span className="promo-tag">UP TO 30% OFF</span>
      <h2>Berry Best <br /> of The Season</h2>
      <p>Fresh hand-picked berries at unbeatable prices.</p>
      <button>Explore now</button>
    </div>
    <img src="https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=900" />
  </div>

  <div className="promo-banner blue">
    <div className="promo-content">
      <span className="promo-tag">UP TO 30% OFF</span>
      <h2>Season’s <br /> Freshest Fruits</h2>
      <p>Sweet, juicy & directly from farms.</p>
      <button>Explore now</button>
    </div>
    <img src="https://images.unsplash.com/photo-1574226516831-e1dff420e43e?w=900" />
  </div>
</section>


      <section className="container pb-20">
        <div className="food-layout">

          {/* SIDEBAR */}
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
                min="50"
                max="1000"
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
  onClick={(e) => {
    e.stopPropagation();
    toggleWishlist(p);
  }}
>
  {isInWishlist(p.id) ? "❤️" : "♡"}
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
      className={i <= Math.round(p.rating || 0) ? "star filled" : "star"}
    >
      ★
    </span>
  ))}
</div>


                  <div className="product-price">
                    <del>₹{p.price}</del>
                    <strong>₹{p.discountPrice || p.price}</strong>
                  </div>
<button
  className="product-btn"
  onClick={(e) => {
    e.stopPropagation();
    addToCart(p);
  }}
>
  Add to Cart
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

      <PromoBanner page="food" />
      <Footer />
    </div>
  );
}
