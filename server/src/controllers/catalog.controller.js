import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Banner from '../models/Banner.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';

/**
 * Catalog endpoints. List/detail responses are json-server-shaped (bare
 * arrays/objects) so the existing storefront renders unchanged — but writes
 * are real, validated and admin-only.
 */

/** GET /api/products?category=&department=&q=&_limit= */
export const listProducts = asyncHandler(async (req, res) => {
  const { category, department, q } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (department) filter.department = department;
  if (q) filter.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  const limit = Math.min(200, parseInt(req.query._limit, 10) || 200);
  const products = await Product.find(filter).sort({ id: 1 }).limit(limit);
  res.json(products);
});

/** GET /api/products/:id */
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ id: Number(req.params.id) });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json(product);
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
