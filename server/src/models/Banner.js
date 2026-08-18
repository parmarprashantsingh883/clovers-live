import mongoose from 'mongoose';

/**
 * Promo + wide marketing banners. `kind` distinguishes the two lists the
 * storefront requests; the rest of the fields are stored as-is (strict:false)
 * so we can serve back whatever shape the frontend already renders.
 */
const bannerSchema = new mongoose.Schema(
  { id: { type: Number, index: true }, kind: { type: String, enum: ['promo', 'wide'], index: true } },
  { strict: false, timestamps: true },
);

bannerSchema.set('toJSON', { transform(_d, r) { delete r._id; delete r.__v; delete r.kind; return r; } });

export default mongoose.model('Banner', bannerSchema);
