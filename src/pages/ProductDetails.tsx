import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { errMsg } from "@/lib/api";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";

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

const API = "/products";

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

  const { user: authUser } = useAuth() as any;
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitReview = async () => {
    if (!myRating) { toast.error("Pick a star rating first"); return; }
    setSubmitting(true);
    try {
      await api.post(`${API}/${id}/reviews`, { rating: myRating, comment: myComment });
      toast.success("Review posted — thank you!");
      setMyRating(0); setMyComment("");
      const res = await api.get(`${API}/${id}`);
      setProduct((prev) => ({ ...prev, ...res.data }));
    } catch (err) {
      toast.error(errMsg(err, "Could not post review"));
    } finally {
      setSubmitting(false);
    }
  };



  useEffect(() => {
  api.get(`${API}/${id}`).then(res => {
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
  if (!product?.category) return;

  // Same-category products (fall back to same department if too few).
  api.get(API, { params: { category: product.category, limit: 12 } }).then(res => {
    let same = res.data.filter(p => p.id !== product.id);
    if (same.length >= 4) { setRelated(same.slice(0, 5)); return; }
    api.get(API, { params: { department: product.department, limit: 12 } }).then(r2 => {
      const more = r2.data.filter(p => p.id !== product.id && !same.some(s => s.id === p.id));
      setRelated([...same, ...more].slice(0, 5));
    });
  });
}, [product?.id]);





  if (!product) return null;

  

  const price = safeNumber(product.price);
  const mrp = safeNumber(product.originalPrice);
  const discountPercent = calcDiscount(mrp, price);
  const saveAmount = mrp > price ? mrp - price : 0;

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
            <strong>₹{price}</strong>

            {saveAmount > 0 && (
              <>
                <del>₹{mrp}</del>
                <span className="save">
                  Save ₹{saveAmount}{discountPercent > 0 ? ` (${discountPercent}% off)` : ""}
                </span>
              </>
            )}

            <p>
              Unit: <b>{product.weight || "1 pc"}</b>
              {product.origin && <> &nbsp; Origin: <b>{product.origin}</b></>}
            </p>
          </div>

          <p className="pd-desc">{product.description}</p>

          <div className="pd-stock">
            {product.stock > 0 ? (
              <>
                <span className="text-green-600 font-semibold">In Stock</span> ·{" "}
                {product.stock} units available
                <span className="timer">
                  {" "}Order within 2hrs for same-day delivery
                </span>
              </>
            ) : (
              <span className="text-red-500 font-semibold">Out of Stock</span>
            )}
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
  Add to Cart – ₹{price * qty}
</button>


</div>



          <div className="pd-features">
            <div><Truck /> Free Delivery<br/><span>Orders ₹499+</span></div>
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

      {(!product.reviewsList || product.reviewsList.length === 0) && (
        <p className="text-gray-500 text-sm mb-4">
          No reviews yet — be the first to review this product.
        </p>
      )}

      {product.reviewsList?.map((r, i) => (
        <div className="pd-review" key={i}>
          <strong>
            {r.userName || r.name}
            {r.verified && (
              <span className="ml-2 text-xs font-medium text-green-600">
                ✓ Verified buyer
              </span>
            )}
          </strong>
          <span>{"⭐".repeat(r.rating)}</span>
          <p>{r.comment}</p>
          {r.createdAt && (
            <p className="text-xs text-gray-400 mt-1">
              {new Date(r.createdAt).toDateString()}
            </p>
          )}
        </div>
      ))}

      {/* WRITE A REVIEW */}
      <div className="mt-8 border-t pt-6 max-w-xl">
        <h4 className="font-semibold mb-3">Write a review</h4>
        {!authUser ? (
          <p className="text-sm text-gray-500">
            <button className="text-red-600 hover:underline" onClick={() => navigate("/login")}>
              Sign in
            </button>{" "}
            to review this product.
          </p>
        ) : (
          <>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} onClick={() => setMyRating(i)} aria-label={`${i} stars`}>
                  <Star
                    size={24}
                    fill={i <= myRating ? "#facc15" : "none"}
                    stroke="#facc15"
                  />
                </button>
              ))}
            </div>
            <textarea
              className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              rows={3}
              maxLength={2000}
              placeholder="What did you like or dislike?"
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
            />
            <button
              className="mt-3 bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
              disabled={submitting}
              onClick={submitReview}
            >
              {submitting ? "Posting…" : "Post Review"}
            </button>
          </>
        )}
      </div>
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
        onClick={() =>
          navigate(`/${(product.department || "food").toLowerCase().replace(" ", "-")}`)
        }
      >
        View All →
      </span>
    </div>

    <div className="product-grid">
      {related.map(p => (
        <ProductCard p={p} key={p.id} />
      ))}
    </div>
  </section>
)}


      <Footer />
    </div>
  );
}
