import Coupon from '../models/Coupon.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';
import { validateCoupon } from '../services/coupon.service.js';

/** POST /api/coupons/validate { code, subtotal } (auth) — preview a discount. */
export const validate = asyncHandler(async (req, res) => {
  const subtotal = Number(req.body?.subtotal) || 0;
  const { coupon, discount } = await validateCoupon({ code: req.body?.code, subtotal, userId: req.user.id });
  res.json({ valid: true, code: coupon.code, discount, description: coupon.description });
});

/* ── Admin CRUD ────────────────────────────────────────── */

export const list = asyncHandler(async (_req, res) => {
  res.json(await Coupon.find().sort({ createdAt: -1 }));
});

export const create = asyncHandler(async (req, res) => {
  const { code, type, value } = req.body || {};
  if (!code || !type || !value) throw new ApiError(422, 'Code, type and value are required');
  if (type === 'percent' && (value < 1 || value > 90)) throw new ApiError(422, 'Percent must be 1–90');
  const coupon = await Coupon.create(req.body);
  res.status(201).json(coupon);
});

export const update = asyncHandler(async (req, res) => {
  const { _id, __v, code: _c, usedCount: _u, ...patch } = req.body || {};
  const coupon = await Coupon.findOneAndUpdate({ code: String(req.params.code).toUpperCase() }, patch, { new: true, runValidators: true });
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  res.json(coupon);
});

export const remove = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOneAndDelete({ code: String(req.params.code).toUpperCase() });
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  res.json({});
});
