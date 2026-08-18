import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    categorySlug: { type: String, index: true },
    icon: { type: String, default: '' },
    image: { type: String, default: '' },
  },
  { timestamps: true },
);

categorySchema.set('toJSON', { transform(_d, r) { delete r._id; delete r.__v; return r; } });

export default mongoose.model('Category', categorySchema);
