import mongoose from 'mongoose';

/** Product review — one per user per product; `verified` = the reviewer has
 *  actually bought the product (checked against their orders at write time). */
const reviewSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 2000 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.set('toJSON', { transform(_d, r) { delete r._id; delete r.__v; return r; } });

export default mongoose.model('Review', reviewSchema);
