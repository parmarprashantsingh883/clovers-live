import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import "../assets/css/best-deals.css";

const API = "http://localhost:5000/products";
const ITEMS_PER_PAGE = 8;

function BestDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    axios.get(API)
      .then(res => {
        const sorted = [...res.data].sort(
          (a, b) =>
            ((b.originalPrice - b.price) / b.originalPrice) -
            ((a.originalPrice - a.price) / a.originalPrice)
        );
        setDeals(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(deals.length / ITEMS_PER_PAGE);

  const paginatedDeals = deals.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <section className="best-deals">
      <div className="container">

        {/* HEADER */}
        <div className="bestdeal-header">
          <h2>
            Best <span>Deals Today</span>
          </h2>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="deal-flex">
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <div className="perfect-card skeleton" key={i}></div>
            ))}
          </div>
        )}

        {/* DEALS */}
        {!loading && (
          <>
            <div className="deal-flex">
              {paginatedDeals.map(item => {
                const discount = Math.round(
                  ((item.originalPrice - item.price) / item.originalPrice) * 100
                );

                return (
                  <div className="perfect-card" key={item.id}>
                    <div className="perfect-img-box">
                      <span className="tag-left">Hot</span>
                      <span className="tag-right">-{discount}%</span>

                      <button
                        className={`wish-btn ${isInWishlist(item.id) ? "active" : ""}`}
                        onClick={() => toggleWishlist(item)}
                      >
                        ♡
                      </button>

                      <img src={item.image} alt={item.name} />
                    </div>

                    <div className="perfect-body">
                      <p className="perfect-title">{item.name}</p>

                      <div className="perfect-price">
                        <strong>₹{item.price}</strong>
                        <span>₹{item.originalPrice}</span>
                      </div>

                      <button
                        className="perfect-btn"
                        onClick={() => addToCart(item)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
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
          </>
        )}

      </div>
    </section>
  );
}

export default BestDeals;
