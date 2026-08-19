import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import "../assets/css/product-card.css";

/** Horizontal shelf of the highest-rated products. */
export default function BestSelling() {
  const [products, setProducts] = useState([]);
  const rowRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/products", { params: { sort: "rating", limit: 12 } })
      .then((res) => setProducts(res.data));
  }, []);

  const scroll = (dir) =>
    rowRef.current?.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });

  return (
    <section className="container" style={{ padding: "28px 0 8px" }}>
      <div className="shelf-head">
        <h2>Bestsellers</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a onClick={() => navigate("/search?sort=rating")}>See all</a>
          <button className="shelf-arrow" onClick={() => scroll("left")}><ChevronLeft size={17} /></button>
          <button className="shelf-arrow" onClick={() => scroll("right")}><ChevronRight size={17} /></button>
        </div>
      </div>

      <div className="shelf-row" ref={rowRef}>
        {products.map((p) => <ProductCard p={p} key={p.id} />)}
      </div>
    </section>
  );
}
