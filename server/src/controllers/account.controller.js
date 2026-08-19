import crypto from 'crypto';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Address from '../models/Address.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';
import { sha256 } from '../lib/jwt.js';
import { sendEmail, templates, emailMode } from '../services/email.service.js';

/* ── Wishlist (account-synced) ─────────────────────────── */

/** GET /api/wishlist — the caller's wishlist as full products. */
export const getWishlist = asyncHandler(async (req, res) => {
  const products = await Product.find({ id: { $in: req.user.wishlist || [] } });
  res.json(products);
});

/** POST /api/wishlist/toggle { productId } → { wishlist:[ids], added } */
export const toggleWishlist = asyncHandler(async (req, res) => {
  const productId = Number(req.body?.productId);
  if (!productId || !(await Product.findOne({ id: productId }))) throw new ApiError(404, 'Product not found');
  const list = new Set(req.user.wishlist || []);
  const added = !list.has(productId);
  if (added) list.add(productId); else list.delete(productId);
  req.user.wishlist = [...list];
  await req.user.save({ validateBeforeSave: false });
  res.json({ wishlist: req.user.wishlist, added });
});

/* ── Address book ──────────────────────────────────────── */

/** GET /api/addresses — the caller's saved addresses (default first). */
export const listAddresses = asyncHandler(async (req, res) => {
  res.json(await Address.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: -1 }));
});

/** POST /api/addresses */
export const createAddress = asyncHandler(async (req, res) => {
  const { label, name, phone, line1, city, state, pincode, isDefault } = req.body || {};
  if (!name || !phone || !line1 || !city) throw new ApiError(422, 'Name, phone, address line and city are required');
  if (isDefault) await Address.updateMany({ userId: req.user.id }, { isDefault: false });
  const count = await Address.countDocuments({ userId: req.user.id });
  const address = await Address.create({
    userId: req.user.id, label, name, phone, line1, city, state, pincode,
    isDefault: !!isDefault || count === 0, // first address becomes default
  });
  res.status(201).json(address);
});

/** PUT /api/addresses/:id */
export const updateAddress = asyncHandler(async (req, res) => {
  const { userId: _u, id: _i, ...patch } = req.body || {};
  if (patch.isDefault) await Address.updateMany({ userId: req.user.id }, { isDefault: false });
  const address = await Address.findOneAndUpdate(
    { id: req.params.id, userId: req.user.id }, patch, { new: true, runValidators: true },
  );
  if (!address) throw new ApiError(404, 'Address not found');
  res.json(address);
});

/** DELETE /api/addresses/:id */
export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({ id: req.params.id, userId: req.user.id });
  if (!address) throw new ApiError(404, 'Address not found');
  res.json({});
});

/* ── Password recovery (mock-first email) ──────────────── */

/** POST /api/auth/forgot-password { email } — always 200 (no enumeration). */
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: String(req.body?.email || '').toLowerCase() });
  let devResetUrl;
  if (user) {
    const raw = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = sha256(raw);
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    const base = (process.env.CLIENT_URL || 'http://localhost:5001').split(',')[0].trim();
    const link = `${base}/reset-password?token=${raw}`;
    await sendEmail({ to: user.email, ...templates.resetPassword(user.fullName, link) });
    // dev convenience: with the mock mailer, surface the link so the flow is testable
    if (emailMode() === 'mock' && process.env.NODE_ENV !== 'production') devResetUrl = link;
  }
  res.json({ success: true, message: 'If that email exists, a reset link has been sent.', ...(devResetUrl ? { devResetUrl } : {}) });
});

/** POST /api/auth/reset-password { token, password } */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || String(password || '').length < 6) throw new ApiError(422, 'A valid token and a 6+ character password are required');
  const user = await User.findOne({
    resetPasswordToken: sha256(token),
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpires');
  if (!user) throw new ApiError(400, 'Reset link is invalid or has expired');
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokenHash = undefined; // revoke sessions
  await user.save();
  res.json({ success: true, message: 'Password reset — you can now sign in.' });
});
