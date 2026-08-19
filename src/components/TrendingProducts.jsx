import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ProductCard from "./ProductCard";
import "../assets/css/product-card.css";
import "../assets/css/trending.css";

const TABS = [
  { label: "All", value: "all" },
  { label: "Snacks", value: "Munchies" },
  { label: "Beverages", value: "Beverages" },
  { label: "Household", value: "Household" },
  { label: "Personal Care", value: "Personal Care" },
];

function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products", { params: { sort: "popular" } })
      .then((res) => { setProducts(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = (activeTab === "all"
    ? products
    : products.filter((p) => p.department === activeTab)
  ).slice(0, 10);

  return (
    <section className="container trending-section">
      {/* HEADER */}
      <div className="trending-header">
        <h2><span>Popular</span> right now</h2>

        <div className="trending-tabs">
          {TABS.map((tab) => (
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
            <div className="pcard skeleton" style={{ height: 280 }} key={i} />
          ))}
        {!loading && filtered.map((p) => <ProductCard p={p} key={p.id} />)}
      </div>
    </section>
  );
}

export default TrendingProducts;
