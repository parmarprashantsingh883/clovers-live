import { useCart } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import "../assets/css/cart.css";
import Breadcrumb from "@/components/Breadcrumb";


export default function CartPage() {
  const {
    cart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    totalPrice,
    clearCart
  } = useCart();

  const navigate = useNavigate();

  const formatPrice = (price) =>
    price.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    });
    const authUser = sessionStorage.getItem("auth_user");

if (!authUser) {
  navigate("/login");
}


  return (
    <>
      <Header />
      <Breadcrumb/>

      <section className="container cart-page">
        <h2 className="cart-title">Shopping Cart</h2>

        {cart.length === 0 ? (
          <p className="cart-empty">Your cart is empty.</p>
        ) : (
          <div className="cart-layout">

            {/* LEFT : CART ITEMS */}
          <div className="cart-items">
  {cart.map((item) => (
    <div className="cart-card" key={item.id}>

      {/* IMAGE */}
      <div className="cart-image">
        <img src={item.image} alt={item.name} />
      </div>

      {/* INFO */}
      <div className="cart-info">
        <h4 className="cart-name">{item.name}</h4>

        <p className="cart-category">
          {item.category_name || "Groceries"}
        </p>

        <p className="cart-unit-price">
          {formatPrice(item.discountPrice || item.price)}
          <span>/ item</span>
        </p>

        {/* QTY + REMOVE */}
        <div className="cart-controls">
          <div className="qty-box">
            <button onClick={() => decreaseQty(item.id)}>-</button>
            <span>{item.qty}</span>
            <button onClick={() => increaseQty(item.id)}>+</button>
          </div>

          <button
            className="remove-btn"
            onClick={() => removeFromCart(item.id)}
          >
            Remove
          </button>
        </div>
      </div>

      {/* TOTAL */}
      <div className="cart-summary">
        <span className="qty-badge">
          Qty {item.qty}
        </span>

        <strong className="cart-total">
          {formatPrice(
            item.qty * (item.discountPrice || item.price)
          )}
        </strong>
      </div>

    </div>
  ))}
</div>


            {/* RIGHT : ORDER SUMMARY */}
            <aside className="cart-summary">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>{formatPrice(10)}</span>
              </div>

              <div className="summary-row total">
                <span>Total</span>
                <span>{formatPrice(totalPrice + 10)}</span>
              </div>

              <button
                className="checkout-btn bg-red-600"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout →
              </button>

              <button className="clear-btn" onClick={clearCart}>
                Clear Cart
              </button>
            </aside>

          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
