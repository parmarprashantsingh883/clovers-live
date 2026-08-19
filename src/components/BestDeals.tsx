import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import "../assets/css/product-card.css";

/** Horizontal shelf of the products with the deepest real discounts. */
function BestDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const rowRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/products")
      .then((res) => {
        const discounted = res.data
          .filter((p) => p.originalPrice && p.originalPrice > p.price)
          .sort(
            (a, b) =>
              (b.originalPrice - b.price) / b.originalPrice -
              (a.originalPrice - a.price) / a.originalPrice
          )
          .slice(0, 12);
        setDeals(discounted);
      })
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir) =>
    rowRef.current?.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });

  if (!loading && deals.length === 0) return null;

  return (
    <section className="container" style={{ padding: "36px 0 8px" }}>
      <div className="shelf-head">
        <h2>Top deals</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a onClick={() => navigate("/deals")}>See all</a>
          <button className="shelf-arrow" onClick={() => scroll("left")}><ChevronLeft size={17} /></button>
          <button className="shelf-arrow" onClick={() => scroll("right")}><ChevronRight size={17} /></button>
        </div>
      </div>

      <div className="shelf-row" ref={rowRef}>
        {loading
          ? [...Array(6)].map((_, i) => <div className="pcard skeleton" style={{ height: 280 }} key={i} />)
          : deals.map((p) => <ProductCard p={p} key={p.id} />)}
      </div>
    </section>
  );
}

export default BestDeals;
