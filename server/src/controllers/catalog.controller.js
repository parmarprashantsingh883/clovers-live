import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Banner from '../models/Banner.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';

/**
 * Catalog endpoints. List/detail responses are json-server-shaped (bare
 * arrays/objects) so the existing storefront renders unchanged — but writes
 * are real, validated and admin-only.
 */

const SORTS = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { rating: -1, reviews: -1 },
  popular: { reviews: -1, rating: -1 },
  newest: { createdAt: -1 },
};

/** GET /api/products?q=&category=&department=&minPrice=&maxPrice=&sort=&page=&limit=
 *  Full storefront search: text, facets, price range, sorting, pagination.
 *  Returns a bare array (json-server shape) with X-Total-Count for pagers. */
export const listProducts = asyncHandler(async (req, res) => {
  const { category, department, q, sort, minPrice, maxPrice } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (department) filter.department = department;
  if (q) filter.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  const limit = Math.min(200, parseInt(req.query.limit || req.query._limit, 10) || 200);
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const [products, total] = await Promise.all([
    Product.find(filter).sort(SORTS[sort] || { id: 1 }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.set('X-Total-Count', String(total));
  res.json(products);
});

/** GET /api/products/:id — includes its latest reviews as `reviewsList`. */
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ id: Number(req.params.id) });
  if (!product) throw new ApiError(404, 'Product not found');
  const reviewsList = await Review.find({ productId: product.id }).sort({ createdAt: -1 }).limit(25);
  res.json({ ...product.toJSON(), reviewsList });
});

/** GET /api/products/:id/reviews */
export const listReviews = asyncHandler(async (req, res) => {
  res.json(await Review.find({ productId: Number(req.params.id) }).sort({ createdAt: -1 }));
});

/** POST /api/products/:id/reviews { rating, comment } (auth) — one per user;
 *  `verified` when the reviewer has actually ordered the product. Updates the
 *  product's aggregate rating + review count. */
export const createReview = asyncHandler(async (req, res) => {
  const productId = Number(req.params.id);
  const product = await Product.findOne({ id: productId });
  if (!product) throw new ApiError(404, 'Product not found');

  const rating = Number(req.body?.rating);
  if (!(rating >= 1 && rating <= 5)) throw new ApiError(422, 'Rating must be 1–5 stars');
  if (await Review.findOne({ productId, userId: req.user.id })) {
    throw new ApiError(409, 'You have already reviewed this product');
  }

  const bought = await Order.findOne({
    userId: req.user.id, status: { $ne: 'Cancelled' }, 'items.id': productId,
  });

  const review = await Review.create({
    productId,
    userId: req.user.id,
    userName: req.user.fullName,
    rating,
    comment: String(req.body?.comment || '').slice(0, 2000),
    verified: !!bought,
  });

  // refresh aggregates on the product
  const agg = await Review.aggregate([
    { $match: { productId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  product.rating = Math.round((agg[0]?.avg || rating) * 10) / 10;
  product.reviews = agg[0]?.count || 1;
  await product.save();

  res.status(201).json(review);
});

/** POST /api/products (admin) */
export const createProduct = asyncHandler(async (req, res) => {
  const { name, price } = req.body || {};
  if (!name || price == null) throw new ApiError(422, 'Name and price are required');
  const last = await Product.findOne().sort({ id: -1 }).select('id');
  const product = await Product.create({ ...req.body, id: (last?.id || 0) + 1 });
  res.status(201).json(product);
});

/** PUT/PATCH /api/products/:id (admin) */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id: _ignore, _id, __v, ...patch } = req.body || {};
  const product = await Product.findOneAndUpdate(
    { id: Number(req.params.id) }, patch, { new: true, runValidators: true },
  );
  if (!product) throw new ApiError(404, 'Product not found');
  res.json(product);
});

/** DELETE /api/products/:id (admin) */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({ id: Number(req.params.id) });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({});
});

/** GET /api/categories */
export const listCategories = asyncHandler(async (_req, res) => {
  res.json(await Category.find().sort({ id: 1 }));
});

/** POST /api/categories (admin) */
export const createCategory = asyncHandler(async (req, res) => {
  if (!req.body?.name) throw new ApiError(422, 'Category name is required');
  const last = await Category.findOne().sort({ id: -1 }).select('id');
  const category = await Category.create({ ...req.body, id: (last?.id || 0) + 1 });
  res.status(201).json(category);
});

/** PUT /api/categories/:id (admin) */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id: _ignore, _id, __v, ...patch } = req.body || {};
  const category = await Category.findOneAndUpdate({ id: Number(req.params.id) }, patch, { new: true, runValidators: true });
  if (!category) throw new ApiError(404, 'Category not found');
  res.json(category);
});

/** DELETE /api/categories/:id (admin) */
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndDelete({ id: Number(req.params.id) });
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({});
});

/** GET /api/promoBanners · GET /api/wideBanners */
export const listBanners = (kind) => asyncHandler(async (_req, res) => {
  res.json(await Banner.find({ kind }).sort({ id: 1 }));
});
