import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "../assets/css/product-card.css";
import "../assets/css/foodpage.css";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";

const API = "/products";
const ITEMS_PER_PAGE = 15;

const categories = [
  "Fresh Fruits","Vegetables","Dairy & Eggs","Snacks","Bakery","Meat & Seafood","Frozen Foods"
];

export default function DealsPage() {
  const [products,setProducts]=useState([]);
  const [selectedCats,setSelectedCats]=useState([]);
  const [stockOnly,setStockOnly]=useState(false);
  const [maxPrice,setMaxPrice]=useState(1000);
  const [ratingFilter,setRatingFilter]=useState(0);
  const [page,setPage]=useState(1);

  useEffect(()=>{
    api.get(API).then(res=>setProducts(res.data));
  },[]);

  /* ---------- ONLY DEAL PRODUCTS ---------- */
  const dealProducts = products.filter(p =>
    p.originalPrice && p.price < p.originalPrice
  );

  const filtered = dealProducts.filter(p=>{
    if(!p.name||!p.price) return false;
    const catMatch = selectedCats.length===0 || selectedCats.includes(p.category);
    const priceMatch = p.price <= maxPrice;
    const stockMatch = !stockOnly || p.stock>0;
    const ratingMatch = !ratingFilter || p.rating>=ratingFilter;
    return catMatch && priceMatch && stockMatch && ratingMatch;
  });

  const totalPages = Math.ceil(filtered.length/ITEMS_PER_PAGE);
  const paginated = filtered.slice((page-1)*ITEMS_PER_PAGE,page*ITEMS_PER_PAGE);

  return(
    <div className="min-h-screen bg-background">
      <Header/>
      <Breadcrumb/>

      <section className="container pb-20">
        <div className="food-layout">

{/* ---------------- LEFT FILTERS ---------------- */}
<aside className="filter-sidebar">

<h3 className="filter-title">Deal Filters</h3>

{categories.map(cat=>(
<label key={cat} className="filter-item">
  <input type="checkbox"
    checked={selectedCats.includes(cat)}
    onChange={()=>setSelectedCats(p=>
      p.includes(cat)?p.filter(x=>x!==cat):[...p,cat]
    )}
  /> {cat}
</label>
))}

<div className="filter-group">
<h4>Max Deal Price</h4>
<input type="range" min="50" max="1000" step="50"
  value={maxPrice} onChange={e=>setMaxPrice(+e.target.value)}
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

{/* ---------------- PRODUCTS GRID ---------------- */}
<div className="product-grid">
{paginated.map(p=>(
  <ProductCard p={p} key={p.id} />
))}
</div>
</div>
</section>

{/* ---------------- PAGINATION ---------------- */}
<div className="pagination-bar my-5 ">
{[...Array(totalPages)].map((_,i)=>(
<button key={i}
className={page===i+1?"active":""}
onClick={()=>setPage(i+1)}
>{i+1}</button>
))}
</div>

<Footer/>
</div>
);
}
