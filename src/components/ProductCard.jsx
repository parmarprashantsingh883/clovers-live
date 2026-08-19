import { useNavigate } from "react-router-dom";
import { Heart, Star, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import "../assets/css/product-card.css";

/**
 * The one product card used everywhere (home shelves, category pages,
 * search, wishlist). Quick-commerce layout: image on white, unit line,
 * price + MRP + % OFF, and an ADD button that becomes a qty stepper
 * once the item is in the cart.
 */

export const FALLBACK_IMG =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' rx='16' fill='#f3f4f6'/><g fill='none' stroke='#d1d5db' stroke-width='6' stroke-linecap='round'><path d='M60 140l30-40 22 26 16-18 12 32z'/><circle cx='78' cy='72' r='10'/></g></svg>`
  );

export default function ProductCard({ p }) {
  const navigate = useNavigate();
  const { cart, addToCart, increaseQty, decreaseQty } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const price = p.discountPrice ?? p.price;
  const mrp = p.originalPrice && p.originalPrice > price ? p.originalPrice : null;
  const off = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const inCart = cart.find((c) => c.id === p.id);
  const out = p.stock === 0;

  return (
    <div className="pcard" onClick={() => navigate(`/product/${p.id}`)}>
      <div className="pcard-media">
        {off > 0 && <span className="pcard-off">{off}% OFF</span>}

        <button
          className={`pcard-wish ${isInWishlist(p.id) ? "active" : ""}`}
          aria-label="Save to wishlist"
          onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
        >
          <Heart size={15} strokeWidth={2.2} />
        </button>

        <img
          src={p.image || FALLBACK_IMG}
          alt={p.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
        />

        {out && <span className="pcard-out">Out of stock</span>}
        {!out && p.stock <= 5 && <span className="pcard-low">Only {p.stock} left</span>}
      </div>

      <div className="pcard-body">
        {p.weight && <p className="pcard-unit">{p.weight}</p>}
        <p className="pcard-name">{p.name}</p>

        {p.reviews > 0 && (
          <span className="pcard-rating">
            <Star size={11} fill="currentColor" strokeWidth={0} />
            {Number(p.rating).toFixed(1)}
            <em>({p.reviews})</em>
          </span>
        )}

        <div className="pcard-foot">
          <div className="pcard-price">
            <strong>₹{price}</strong>
            {mrp && <del>₹{mrp}</del>}
          </div>

          {out ? (
            <span className="pcard-add disabled">Sold out</span>
          ) : !inCart ? (
            <button
              className="pcard-add"
              onClick={(e) => { e.stopPropagation(); addToCart(p); }}
            >
              ADD
            </button>
          ) : (
            <div className="pcard-stepper" onClick={(e) => e.stopPropagation()}>
              <button aria-label="Decrease" onClick={() => decreaseQty(p.id)}><Minus size={13} /></button>
              <span>{inCart.qty}</span>
              <button aria-label="Increase" onClick={() => increaseQty(p.id)}><Plus size={13} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
