import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';
import { createGatewayOrder, verifySignature, paymentMode } from '../services/payment.service.js';

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
  const { items, paymentMethod = 'cod', address = {} } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) throw new ApiError(422, 'Your cart is empty');
  if (!address?.name || !address?.phone) throw new ApiError(422, 'Delivery name and phone are required');

  // Load real products; validate stock.
  const ids = items.map((i) => Number(i.id));
  const products = await Product.find({ id: { $in: ids } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines = [];
  let total = 0;
  for (const item of items) {
    const p = byId.get(Number(item.id));
    const qty = Math.max(1, Math.min(50, Number(item.qty) || 1));
    if (!p) throw new ApiError(422, `Product ${item.id} no longer exists`);
    if (p.stock < qty) throw new ApiError(409, `Only ${p.stock} left of "${p.name}"`);
    lines.push({ id: p.id, name: p.name, price: p.price, qty, image: p.image });
    total += p.price * qty;
  }

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
    items: lines,
    paymentMethod,
    address,
    payment: { status: paymentMethod === 'cod' ? 'pending' : 'pending' },
  });

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
  await order.save();
  res.json({ order, mode: paymentMode() });
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
  const patch = {};
  if (req.body?.status) {
    if (!ORDER_STATUSES.includes(req.body.status)) throw new ApiError(422, `Status must be one of: ${ORDER_STATUSES.join(', ')}`);
    patch.status = req.body.status;
  }
  const order = await Order.findOneAndUpdate({ id: req.params.id }, patch, { new: true });
  if (!order) throw new ApiError(404, 'Order not found');
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
  const [orders, revenueAgg, customers, products, recent, byStatus] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    mongoose.model('User').countDocuments({ role: 'user' }),
    Product.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(6),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);
  res.json({
    orders,
    revenue: revenueAgg[0]?.total || 0,
    customers,
    products,
    recentOrders: recent,
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
  });
});
