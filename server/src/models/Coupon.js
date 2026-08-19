import mongoose from 'mongoose';

/** Discount coupon — percent or flat, with expiry, minimum order and usage caps. */
const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'flat'], required: true },
    value: { type: Number, required: true, min: 1 },          // % (1-90) or ₹
    maxDiscount: { type: Number, default: null },             // cap for percent coupons
    minOrder: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    usageLimit: { type: Number, default: null },              // total redemptions allowed
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: null },
    active: { type: Boolean, default: true },
    description: { type: String, default: '' },
  },
  { timestamps: true },
);

couponSchema.set('toJSON', { transform(_d, r) { delete r._id; delete r.__v; return r; } });

export default mongoose.model('Coupon', couponSchema);
