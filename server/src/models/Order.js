import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  { id: Number, name: String, price: Number, qty: Number, image: String },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },      // ORD-YYYY-NNN
    userId: { type: String, index: true },
    date: { type: String },
    status: {
      type: String,
      enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
      index: true,
    },
    total: { type: Number, required: true, min: 0 },
    charges: {
      subtotal: Number, discount: Number, delivery: Number,
      codFee: Number, convenienceFee: Number, gst: Number,
    },
    items: { type: [orderItemSchema], default: [] },
    paymentMethod: { type: String, default: 'cod' },
    address: {
      name: String, phone: String, line1: String, city: String, state: String, pincode: String,
    },
    payment: {
      status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
      gatewayOrderId: { type: String, default: null },
      gatewayPaymentId: { type: String, default: null },
    },
  },
  { timestamps: true, minimize: false },
);

orderSchema.set('toJSON', { transform(_d, r) { delete r._id; delete r.__v; return r; } });

export default mongoose.model('Order', orderSchema);
