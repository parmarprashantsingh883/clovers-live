import mongoose from 'mongoose';

/** Saved delivery address (address book). */
const addressSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    label: { type: String, default: 'Home', maxlength: 30 },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: '', trim: true },
    pincode: { type: String, default: '', trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

addressSchema.pre('validate', function (next) {
  if (!this.id) this.id = `addr_${Date.now()}${Math.floor(Math.random() * 1000)}`;
  next();
});

addressSchema.set('toJSON', { transform(_d, r) { delete r._id; delete r.__v; return r; } });

export default mongoose.model('Address', addressSchema);
