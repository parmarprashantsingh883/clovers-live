import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import { ApiError } from '../middleware/error.middleware.js';

/**
 * Validate a coupon for a user + subtotal; returns { coupon, discount }.
 * Throws a friendly 422 explaining exactly why a code doesn't apply.
 */
export async function validateCoupon({ code, subtotal, userId }) {
  const clean = String(code || '').trim().toUpperCase();
  if (!clean) throw new ApiError(422, 'Enter a coupon code');

  const coupon = await Coupon.findOne({ code: clean });
  if (!coupon || !coupon.active) throw new ApiError(422, 'Invalid or inactive coupon');
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new ApiError(422, 'This coupon has expired');
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    throw new ApiError(422, `Add items worth ₹${(coupon.minOrder - subtotal).toLocaleString('en-IN')} more to use ${clean}`);
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(422, 'This coupon has been fully redeemed');
  }
  if (coupon.perUserLimit != null && userId) {
    const used = await Order.countDocuments({ userId, couponCode: clean, status: { $ne: 'Cancelled' } });
    if (used >= coupon.perUserLimit) throw new ApiError(422, `You've already used ${clean} the maximum number of times`);
  }

  let discount = coupon.type === 'percent' ? Math.round(subtotal * (coupon.value / 100)) : coupon.value;
  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, subtotal);
  return { coupon, discount };
}

/** Count a successful redemption. */
export async function redeemCoupon(code) {
  if (!code) return;
  await Coupon.updateOne({ code: String(code).toUpperCase() }, { $inc: { usedCount: 1 } });
}
