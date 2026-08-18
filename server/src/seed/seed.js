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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_JSON = path.join(__dirname, '..', '..', '..', 'Backend', 'db.json');

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
  }
  await Product.insertMany(products);
  await Order.insertMany((db.orders || []).map((o) => ({ ...o, payment: { status: o.paymentMethod === 'cod' ? 'pending' : 'paid' } })));

  // Users + admin go through create() so passwords hash via the pre-save hook.
  for (const u of db.users || []) {
    await User.create({ id: String(u.id), fullName: u.fullName, email: u.email, phone: u.phone, password: u.password || '123456', role: 'user', status: u.status || 'active', createdAt: u.createdAt });
  }
  for (const a of db.admin || []) {
    await User.create({ id: String(a.id), fullName: a.fullName, email: a.email, password: a.password || 'admin123', role: 'admin', status: a.status || 'active' });
  }

  for (const b of db.promoBanners || []) await Banner.create({ ...b, kind: 'promo' });
  for (const b of db.wideBanners || []) await Banner.create({ ...b, kind: 'wide' });

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
