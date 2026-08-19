import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    image: { type: String, default: '' },
    images: { type: [String], default: [] },   // gallery; images[0] mirrors `image`
    category: { type: String, index: true },
    department: { type: String, index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '' },
    weight: { type: String, default: '' },
    stock: { type: Number, default: 0, min: 0 },
    origin: { type: String, default: '' },
    nutritionFacts: {
      calories: Number,
      protein: String,
      carbs: String,
      fiber: String,
    },
  },
  { timestamps: true, minimize: false },
);

productSchema.set('toJSON', { transform(_d, r) { delete r._id; delete r.__v; return r; } });

export default mongoose.model('Product', productSchema);
