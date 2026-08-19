import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';
import { createGatewayOrder, verifySignature, paymentMode } from '../services/payment.service.js';
import { validateCoupon, redeemCoupon } from '../services/coupon.service.js';
import { sendEmail, templates } from '../services/email.service.js';

const stamp = (order, status, note = '') => order.timeline.push({ status, at: new Date(), note });
const emailUser = async (req, order, tpl) => {
  try { await sendEmail({ to: req.user.email, ...tpl(order) }); } catch { /* best-effort */ }
};

const ORDER_STATUSES = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

async function nextOrderId() {
  const year = new Date().getFullYear();
  const count = await Order.countDocuments({ id: new RegExp(`^ORD-${year}-`) });
  return `ORD-${year}-${String(count + 1).padStart(3, '0')}`;
}

/**
 * POST /api/orders — place an order (auth user).
 * The server is the source of truth: prices come from the DB (the client's
 * prices are ignored), stock is checked and decremented, and the total is
 * computed here. Body: { items:[{id, qty}], paymentMethod, address }.
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, paymentMethod = 'cod', address = {}, deliveryType = 'free', couponCode = '' } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) throw new ApiError(422, 'Your cart is empty');
  if (!address?.name || !address?.phone) throw new ApiError(422, 'Delivery name and phone are required');

  // Load real products; validate stock.
  const ids = items.map((i) => Number(i.id));
  const products = await Product.find({ id: { $in: ids } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines = [];
  let subtotal = 0;
  for (const item of items) {
    const p = byId.get(Number(item.id));
    const qty = Math.max(1, Math.min(50, Number(item.qty) || 1));
    if (!p) throw new ApiError(422, `Product ${item.id} no longer exists`);
    if (p.stock < qty) throw new ApiError(409, `Only ${p.stock} left of "${p.name}"`);
    lines.push({ id: p.id, name: p.name, price: p.price, qty, image: p.image });
    subtotal += p.price * qty;
  }

  // Pricing is server-authoritative. Coupons go through the real engine
  // (expiry, min order, usage caps) — an invalid code fails the order loudly
  // rather than silently dropping the discount the user expected.
  let discount = 0;
  if (couponCode) ({ discount } = await validateCoupon({ code: couponCode, subtotal, userId: req.user.id }));
  const delivery = subtotal >= 499 ? 0 : deliveryType === 'express' ? 99 : deliveryType === 'standard' ? 49 : 0;
  const codFee = paymentMethod === 'cod' ? 30 : 0;
  const convenienceFee = 9;
  const gst = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + delivery + codFee + convenienceFee + gst;

  // Decrement stock guarded by the current level (no oversell on races).
  for (const line of lines) {
    const r = await Product.updateOne({ id: line.id, stock: { $gte: line.qty } }, { $inc: { stock: -line.qty } });
    if (r.modifiedCount === 0) throw new ApiError(409, `"${line.name}" just sold out — please review your cart`);
  }

  const order = await Order.create({
    id: await nextOrderId(),
    userId: req.user.id,
    date: new Date().toISOString().slice(0, 10),
    status: 'Processing',
    total,
    charges: { subtotal, discount, delivery, codFee, convenienceFee, gst },
    items: lines,
    paymentMethod,
    couponCode: couponCode ? String(couponCode).toUpperCase() : '',
    address,
    payment: { status: 'pending' },
    timeline: [{ status: 'Processing', at: new Date(), note: 'Order placed' }],
  });
  if (couponCode) await redeemCoupon(couponCode);
  await emailUser(req, order, templates.orderConfirmed);

  // Online payment → hand back a gateway order to complete on the client.
  if (paymentMethod !== 'cod') {
    const gw = await createGatewayOrder({ amountInRupees: total, receiptId: order.id });
    order.payment.gatewayOrderId = gw.order.id;
    await order.save();
    return res.status(201).json({ order, payment: { ...gw } });
  }
  res.status(201).json({ order });
});

/** POST /api/orders/:id/verify-payment { paymentId, signature } */
export const verifyPayment = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ id: req.params.id });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.userId !== req.user.id && req.user.role !== 'admin') throw new ApiError(403, 'Not your order');
  const { paymentId, signature } = req.body || {};
  if (!verifySignature({ orderId: order.payment.gatewayOrderId, paymentId, signature })) {
    throw new ApiError(400, 'Payment verification failed');
  }
  order.payment.status = 'paid';
  order.payment.gatewayPaymentId = paymentId || null;
  order.status = 'Confirmed';
  stamp(order, 'Confirmed', 'Payment received');
  await order.save();
  await emailUser(req, order, templates.orderStatus);
  res.json({ order, mode: paymentMode() });
});

/** POST /api/orders/:id/cancel — the customer can cancel before dispatch;
 *  items are restocked and the timeline records it. */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ id: req.params.id });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.userId !== req.user.id && req.user.role !== 'admin') throw new ApiError(403, 'Not your order');
  if (!['Processing', 'Confirmed'].includes(order.status)) {
    throw new ApiError(409, `Order can no longer be cancelled (${order.status})`);
  }
  for (const line of order.items) {
    await Product.updateOne({ id: line.id }, { $inc: { stock: line.qty } });
  }
  order.status = 'Cancelled';
  stamp(order, 'Cancelled', order.payment.status === 'paid'
    ? 'Cancelled by customer — refund will be processed to the original payment method'
    : 'Cancelled by customer');
  await order.save();
  await emailUser(req, order, templates.orderStatus);
  res.json({ order });
});

/** POST /api/orders/:id/reorder — the order's items with live availability,
 *  ready to refill the cart. */
export const reorder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ id: req.params.id });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.userId !== req.user.id && req.user.role !== 'admin') throw new ApiError(403, 'Not your order');
  const products = await Product.find({ id: { $in: order.items.map((i) => i.id) } });
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = order.items.map((line) => {
    const p = byId.get(line.id);
    return {
      product: p || null,
      requestedQty: line.qty,
      available: p ? Math.min(line.qty, p.stock) : 0,
    };
  });
  res.json({ items });
});

/** GET /api/orders — admin sees all; a user sees their own. */
export const listOrders = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
  if (req.query.userId && req.user.role === 'admin') filter.userId = String(req.query.userId);
  res.json(await Order.find(filter).sort({ createdAt: -1 }));
});

/** GET /api/orders/:id — owner or admin. */
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ id: req.params.id });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.userId !== req.user.id && req.user.role !== 'admin') throw new ApiError(403, 'Not your order');
  res.json(order);
});

/** PUT/PATCH /api/orders/:id (admin) — status / fulfillment updates only. */
export const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ id: req.params.id });
  if (!order) throw new ApiError(404, 'Order not found');
  if (req.body?.status && req.body.status !== order.status) {
    if (!ORDER_STATUSES.includes(req.body.status)) throw new ApiError(422, `Status must be one of: ${ORDER_STATUSES.join(', ')}`);
    // admin cancellation restocks too
    if (req.body.status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const line of order.items) await Product.updateOne({ id: line.id }, { $inc: { stock: line.qty } });
    }
    order.status = req.body.status;
    stamp(order, req.body.status, 'Updated by store');
    await order.save();
  }
  res.json(order);
});

/** DELETE /api/orders/:id (admin). */
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndDelete({ id: req.params.id });
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({});
});

/** GET /api/admin/stats — dashboard aggregates from real data. */
export const adminStats = asyncHandler(async (_req, res) => {
  const [orders, revenueAgg, customers, products, recent, byStatus, topProducts] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    mongoose.model('User').countDocuments({ role: 'user' }),
    Product.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(6),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.id',
        name: { $first: '$items.name' },
        image: { $first: '$items.image' },
        sold: { $sum: '$items.qty' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
      } },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]),
  ]);
  res.json({
    orders,
    revenue: revenueAgg[0]?.total || 0,
    customers,
    products,
    recentOrders: recent,
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    topProducts,
  });
});
