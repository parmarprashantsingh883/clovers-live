

export default function OrderPlacedModal({ open, orderId, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>🎉 Order Placed Successfully</h2>
        <p>
          Your order ID is <strong>#{orderId}</strong>
        </p>

        <button className="modal-btn" onClick={onClose}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
