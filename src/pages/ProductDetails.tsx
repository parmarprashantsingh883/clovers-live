import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

import {
  Star,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Share2,
} from "lucide-react";
import "./ProductDetailsPage.css";

const API = "https://clovers-live-production.up.railway.app/products";

const safeNumber = (val, fallback = 0) => {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

const calcDiscount = (price, discount) => {
  if (!price || !discount || discount >= price) return 0;
  return Math.round(((price - discount) / price) * 100);
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();       // 👈 here
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [wish, setWish] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [related, setRelated] = useState([]);

  const [tab, setTab] = useState("details");



  useEffect(() => {
  axios.get(`${API}/${id}`).then(res => {
    const p = res.data;

    // Normalize product fields
   setProduct({
  ...p,
  id: Number(p.id), // 🔥 FORCE ID CONSISTENCY
  name: p.name || p.title,
  discountPrice: p.discountPrice ?? p.price,
  image: p.image || p.images?.[0],
});


    setActiveImg(0);
  });
}, [id]);


 useEffect(() => {
  if (!product) return;

  axios.get(API).then(res => {

    const currentCatId =
      product.category_id ||
      (product.category_name &&
        product.category_name.toLowerCase().includes("fruit") ? 1 : null);

    if (!currentCatId) return;

    const sameCat = res.data.filter(
      p => p.id !== product.id && p.category_id === currentCatId
    );

    setRelated(sameCat.slice(0, 4));
  });
}, [product]);





  if (!product) return null;

  

  const price = safeNumber(product.price);
  const discountPrice = safeNumber(product.discountPrice, price);
  const discountPercent = calcDiscount(price, discountPrice);
  const saveAmount = price - discountPrice;

  return (
    <div className="min-h-screen bg-white">
      <Header />
   {<Breadcrumb product={product} />}


      <section className="container product-detail-grid">

        {/* IMAGE */}
      <div className="pd-image-wrap">

  <div className="pd-image-box">
    <img
      src={product.images?.[activeImg] || product.image}
      alt={product.name}
    />
  </div>

  <div className="pd-thumbs">
    {(product.images || [product.image]).map((img, i) => (
      <button
        key={i}
        onClick={() => setActiveImg(i)}
        className={activeImg === i ? "active" : ""}
      >
        <img src={img} />
      </button>
    ))}
  </div>

</div>



        {/* INFO */}
        <div className="pd-info">
          <div className="pd-tags">
            <span className="pd-chip">{product.name}</span>
            <span className="pd-chip outline">Premium Quality</span>
          </div>

          <h1>{product.name}</h1>

          <div className="pd-rating">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={i < Math.round(product.rating || 0) ? "#facc15" : "none"}
                stroke="#facc15"
              />
            ))}
            <span className="score">{product.rating || 0}</span>
            <span className="review">({product.reviews || 0} reviews)</span>
            <Share2 size={16} />
          </div>

          <div className="pd-price-box">
            <strong>₹{discountPrice.toFixed(2)}</strong>

            {price > discountPrice && (
              <>
                <del>₹{price.toFixed(2)}</del>
                <span className="save">Save ${saveAmount.toFixed(2)}</span>
              </>
            )}

            <p>
              Weight: <b>{product.weight || "N/A"}</b> &nbsp;
              Origin: <b>{product.origin || "N/A"}</b>
            </p>
          </div>

          <p className="pd-desc">{product.description}</p>

          <div className="pd-stock">
            <span className="text-green-600 font-semibold">In Stock</span> ·{" "}
            {product.stock || 0} units available
            <span className="timer">
              {" "}Order within 2hrs for same-day delivery
            </span>
          </div>

         <div className="pd-cart-wrap">

  <div className="pd-qty-pill">
    <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
    <span>{qty}</span>
    <button onClick={() => setQty(q => q + 1)}>+</button>
  </div>
<button
  className="pd-cart-btn-main"
  onClick={() =>
    addToCart({
      ...product,
      qty,
    })
  }
>
  Add to Cart – ₹{(discountPrice * qty).toFixed(2)}
</button>


</div>



          <div className="pd-features">
            <div><Truck /> Free Delivery<br/><span>Orders $50+</span></div>
            <div><Shield /> Quality Guarantee<br/><span>100% Fresh</span></div>
            <div><RotateCcw /> Easy Returns<br/><span>30 Days</span></div>
          </div>
        </div>
      </section>
      <div className="pd-tabs">
  {["details", "nutrition", "reviews"].map(t => (
    <button
      key={t}
      className={tab === t ? "active" : ""}
      onClick={() => setTab(t)}
    >
      {t}
    </button>
  ))}
</div>

<div className="pd-tab-content">

  {tab === "details" && (
    <>
      <h3>Product Details</h3>
      <p>{product.description}</p>
      <ul>
        {product.features?.map((f,i) => (
          <li key={i}>✔ {f}</li>
        ))}
      </ul>
    </>
  )}

  {tab === "nutrition" && (
    <>
      <h3>Nutrition Facts</h3>
      <ul className="pd-nutrition">
        {Object.entries(product.nutritionFacts || {}).map(([k,v]) => (
          <li key={k}><b>{k}</b><span>{/*v*/}</span></li>
        ))}
      </ul>
    </>
  )}

  {tab === "reviews" && (
    <>
      <h3>Customer Reviews</h3>
      {product.reviewsList?.map((r,i) => (
        <div className="pd-review" key={i}>
          <strong>{r.name}</strong>
          <span>{"⭐".repeat(r.rating)}</span>
          <p>{r.comment}</p>
        </div>
      ))}
    </>
  )}

</div>

{/* realted card */}
{related.length > 0 && (
  <section className="container py-20">
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-2xl font-bold">You May Also Like</h2>
      <span
        className="text-red-500 cursor-pointer"
        onClick={() => navigate(`/category/${product.category}`)}
      >
        View All →
      </span>
    </div>

    <div className="product-grid">
      {related.map(p => (
        <div
          key={p.id}
          className="product-card"
          onClick={() => navigate(`/product/${p.id}`)}
        >
          <div className="product-img">
            {p.stock === 0 && <span className="stock-badge out">Out of Stock</span>}
            {p.stock > 0 && p.stock < 10 && (
              <span className="stock-badge low">Only {p.stock} left</span>
            )}

            <button className="product-wish">♡</button>
            <img src={p.image} alt={p.name} />
          </div>

          <div className="product-body">
            <p className="product-title">{p.name}</p>

            <p className="product-desc">
              {p.description || "Premium quality product for your daily needs."}
            </p>

            <div className="product-price">
              <strong>₹{p.discountPrice}</strong>
              <span>₹{p.price}</span>
            </div>

         <button
  type="button"
  className="pd-cart-btn-main"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      ...product,
      qty: qty,
    });
  }}
>
  Add to Cart – 
</button>






          </div>
        </div>
      ))}
    </div>
  </section>
)}


      <Footer />
    </div>
  );
}
