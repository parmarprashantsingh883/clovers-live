import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Users and admins share one collection, distinguished by `role`. The external
 * identifier is the string `id` (json-server compatible; the frontend reads it).
 */
const userSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    fullName: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: {
      type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    phone: { type: String, trim: true, maxlength: 20 },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    wishlist: { type: [Number], default: [] },                 // product ids
    refreshTokenHash: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    createdAt: { type: Date, default: Date.now },
  },
  { minimize: false },
);

userSchema.pre('validate', function (next) {
  if (!this.id) this.id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret._id; delete ret.__v; delete ret.password; delete ret.refreshTokenHash;
    delete ret.resetPasswordToken; delete ret.resetPasswordExpires;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
