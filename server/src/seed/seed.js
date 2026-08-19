/**
 * Seed MongoDB from the original json-server db.json — preserves all products,
 * categories, orders and banners, and migrates the (previously plaintext) user
 * & admin passwords to bcrypt hashes.
 * Run standalone: `npm run seed`. Auto-runs on boot when SEED_ON_BOOT=true.
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Banner from '../models/Banner.js';
import Coupon from '../models/Coupon.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_JSON = path.join(__dirname, '..', '..', '..', 'Backend', 'db.json');

/**
 * db.json barely tags products (71/72 have no department, and the pages'
 * category tabs never matched the data). Classify every product by name so
 * the department pages and their sidebar tabs actually work. Order matters —
 * specific rules before generic ones.
 */
const RULES = [
  ['Personal Care', 'Hair Care', /shampoo|keratin|curl|styling/i],
  ['Personal Care', 'Skincare', /face wash|cleanser|vitamin c|cerave|dot & key|minimalist/i],
  ['Personal Care', 'Body Care', /soap|body wash|talcum|bath/i],
  ['Household', 'Cleaning', /cleaner|detergent|tide|mop|pochha|microfiber/i],
  ['Household', 'Kitchen & Disposables', /tissue|foil|paper glass|disposable/i],
  ['Munchies', 'Chips & Crisps', /chips|doritos|popcorn/i],
  ['Munchies', 'Chocolates', /chocolate bar|kitkat|dairy milk|raffaello|choco pie|choco wafer/i],
  ['Munchies', 'Cookies & Biscuits', /cookie|choco fills|choco chunk/i],
  ['Munchies', 'Dry Snacks', /cashew|namkeen|vade|energy bar|haldiram|aloo lachha/i],
  ['Beverages', 'Soft Drinks', /pepsi|sprite|thums|bubbly|sparkling|soft drink|sepoy/i],
  ['Beverages', 'Juices', /juice|frooti/i],
  ['Beverages', 'Dairy Drinks', /lassi|milkshake|milk drink|flavoured milk|smoodh/i],
  ['Food', 'Frozen Foods', /frozen|ice cream|dolly|magnum/i],
  ['Food', 'Fresh Fruits', /apple|banana|orange|kinnow/i],
  ['Food', 'Vegetables', /tomato|broccoli/i],
  ['Food', 'Dairy & Eggs', /milk|egg/i],
  ['Food', 'Bakery', /bread|loaf/i],
  ['Food', 'Meat & Seafood', /chicken/i],
];

function classify(name = '') {
  for (const [department, category, rx] of RULES) {
    if (rx.test(name)) return { department, category };
  }
  return { department: 'Food', category: 'Snacks' };
}

// The handful of legacy mock products point at dead image URLs — swap in live ones.
const IMAGE_FIXES = {
  'Milk 1L': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
  'Brown Bread': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=400&fit=crop',
  'Farm Fresh Eggs': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop',
  'Potato Chips': 'https://images.pexels.com/photos/479628/pexels-photo-479628.jpeg?w=400&h=400&fit=crop',
  'Chicken Breast': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop',
  'Frozen Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
  'Face Wash': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop',
  'Floor Cleaner': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop',
};

/**
 * db.json mixes two price shapes: {price, originalPrice} and
 * {price, oldPrice, discountPrice}. Normalize to: price = what you pay,
 * originalPrice = MRP only when there is a real discount. Also derive a
 * display unit ("1kg", "500 ml", "Pack of 25") from the name when missing.
 */
function normalize(p) {
  const selling = Math.round(Number(p.discountPrice ?? p.price) || 0);
  const mrp = Math.round(Number(p.oldPrice ?? p.originalPrice) || 0);
  p.price = selling;
  p.originalPrice = mrp > selling ? mrp : undefined;
  delete p.oldPrice;
  delete p.discountPrice;

  if (!p.weight) {
    const m = (p.name || '').match(/(\d+(?:\.\d+)?\s?(?:kg|g|gm|l|ltr|ml)|pack of \d+|\d+\s?(?:pc|pcs|pieces))\b/i);
    p.weight = m ? m[1] : '1 pc';
  }
  if (IMAGE_FIXES[(p.name || '').trim()]) p.image = IMAGE_FIXES[(p.name || '').trim()];

  // Gallery: keep the db.json images array (http URLs only), make sure the
  // primary image leads it, and cap it at 6 thumbs.
  const gallery = (Array.isArray(p.images) ? p.images : []).filter((u) => /^https?:/.test(u || ''));
  p.images = [p.image, ...gallery.filter((u) => u !== p.image)].filter(Boolean).slice(0, 6);
  return p;
}

export async function runSeed({ exitAfter = true, force = false } = {}) {
  if (!mongoose.connection.readyState) {
    const { connectDB } = await import('../config/db.js');
    await connectDB();
  }

  const already = await Product.countDocuments();
  if (already > 0 && !force) {
    console.log('🌱 Seed skipped — data already present');
    if (exitAfter) process.exit(0);
    return;
  }
  if (force) {
    await Promise.all([User.deleteMany({}), Product.deleteMany({}), Category.deleteMany({}), Order.deleteMany({}), Banner.deleteMany({})]);
  }

  const db = JSON.parse(fs.readFileSync(DB_JSON, 'utf8'));
  console.log('🌱 Seeding from db.json…');

  await Category.insertMany(db.categories || []);

  // db.json (Lovable-generated) contains duplicate product ids — keep the
  // first occurrence's id and re-id any collision past the current max.
  const products = db.products || [];
  const seen = new Set();
  let nextId = Math.max(0, ...products.map((p) => Number(p.id) || 0));
  for (const p of products) {
    if (seen.has(p.id)) { nextId += 1; p.id = nextId; }
    seen.add(p.id);
    const tag = classify(p.name);
    p.department = tag.department;
    p.category = tag.category;
    normalize(p);
  }
  await Product.insertMany(products);

  // Legacy demo orders: round rupee amounts and heal dead item-image URLs
  // (order items embed a snapshot of the image at purchase time).
  const orders = (db.orders || []).map((o) => ({
    ...o,
    total: Math.round(Number(o.total) || 0),
    items: (o.items || []).map((it) => ({
      ...it,
      price: Math.round(Number(it.price) || 0),
      image: IMAGE_FIXES[(it.name || '').trim()] || it.image,
    })),
    payment: { status: o.paymentMethod === 'cod' ? 'pending' : 'paid' },
  }));
  await Order.insertMany(orders);

  // Users + admin go through create() so passwords hash via the pre-save hook.
  for (const u of db.users || []) {
    await User.create({ id: String(u.id), fullName: u.fullName, email: u.email, phone: u.phone, password: u.password || '123456', role: 'user', status: u.status || 'active', createdAt: u.createdAt });
  }
  for (const a of db.admin || []) {
    await User.create({ id: String(a.id), fullName: a.fullName, email: a.email, password: a.password || 'admin123', role: 'admin', status: a.status || 'active' });
  }

  for (const b of db.promoBanners || []) await Banner.create({ ...b, kind: 'promo' });
  for (const b of db.wideBanners || []) await Banner.create({ ...b, kind: 'wide' });

  // Starter coupons (FRESH10 keeps the checkout's advertised code working)
  await Coupon.create([
    { code: 'FRESH10', type: 'percent', value: 10, minOrder: 299, description: '10% off orders above ₹299' },
    { code: 'WELCOME50', type: 'flat', value: 50, minOrder: 199, perUserLimit: 1, description: '₹50 off your first order above ₹199' },
  ]);

  const counts = {
    products: await Product.countDocuments(),
    categories: await Category.countDocuments(),
    users: await User.countDocuments({ role: 'user' }),
    admins: await User.countDocuments({ role: 'admin' }),
    orders: await Order.countDocuments(),
    banners: await Banner.countDocuments(),
  };
  console.log('🌱 Seed complete:', counts);
  console.log('   admin: admin@gmail.com / admin123   ·   user: parmarprashantsingh883@gmail.com / 123456');

  if (exitAfter) { await mongoose.disconnect(); process.exit(0); }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed({ exitAfter: true }).catch((e) => { console.error('Seed failed:', e); process.exit(1); });
}
