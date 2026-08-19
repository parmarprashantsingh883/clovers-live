import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

const { default: app } = await import('../src/app.js');
const { runSeed } = await import('../src/seed/seed.js');

let mem;
const login = (email, password) => request(app).post('/api/auth/login').send({ email, password });
const adminLogin = () => request(app).post('/api/auth/admin/login').send({ email: 'admin@gmail.com', password: 'admin123' });
const auth = (t) => ({ Authorization: `Bearer ${t}` });

let userToken;
let adminToken;

beforeAll(async () => {
  mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri('clovers_test'));
  await runSeed({ exitAfter: false });
  userToken = (await login('parmarprashantsingh883@gmail.com', '123456')).body.data.accessToken;
  adminToken = (await adminLogin()).body.data.accessToken;
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mem?.stop();
});

describe('auth (real, hashed passwords)', () => {
  it('seeded user logs in with the right password only', async () => {
    expect((await login('parmarprashantsingh883@gmail.com', '123456')).status).toBe(200);
    expect((await login('parmarprashantsingh883@gmail.com', 'wrong')).status).toBe(401);
  });

  it('admin endpoint refuses non-admins; user endpoint refuses admins', async () => {
    const r = await request(app).post('/api/auth/admin/login').send({ email: 'parmarprashantsingh883@gmail.com', password: '123456' });
    expect(r.status).toBe(403);
    const r2 = await request(app).post('/api/auth/login').send({ email: 'admin@gmail.com', password: 'admin123' });
    expect(r2.status).toBe(403);
  });

  it('signup creates a working account and never returns the password', async () => {
    const email = `t_${Date.now()}@test.com`;
    const r = await request(app).post('/api/auth/signup').send({ fullName: 'Test User', email, password: 'secret1' });
    expect(r.status).toBe(201);
    expect(r.body.data.user.password).toBeUndefined();
    expect((await login(email, 'secret1')).status).toBe(200);
  });
});

describe('catalog', () => {
  it('serves seeded products & categories publicly (json-server shape)', async () => {
    const p = await request(app).get('/api/products');
    expect(p.status).toBe(200);
    expect(p.body.length).toBe(72);
    const c = await request(app).get('/api/categories');
    expect(c.body.length).toBe(11);
  });

  it('filters by category and search', async () => {
    const r = await request(app).get('/api/products?q=apple');
    expect(r.body.every((x) => /apple/i.test(x.name))).toBe(true);
  });

  it('product writes are admin-only', async () => {
    expect((await request(app).post('/api/products').send({ name: 'X', price: 1 })).status).toBe(401);
    expect((await request(app).post('/api/products').set(auth(userToken)).send({ name: 'X', price: 1 })).status).toBe(403);
    const ok = await request(app).post('/api/products').set(auth(adminToken)).send({ name: 'Test Item', price: 99, stock: 5 });
    expect(ok.status).toBe(201);
    expect(ok.body.id).toBeGreaterThan(0);
  });
});

describe('orders — server-authoritative pricing & stock', () => {
  it('computes total from DB prices + fees, ignores client tampering', async () => {
    const r = await request(app).post('/api/orders').set(auth(userToken)).send({
      items: [{ id: 1, qty: 2, price: 1 }], // client "price" must be ignored
      paymentMethod: 'cod',
      address: { name: 'T', phone: '9' },
    });
    expect(r.status).toBe(201);
    const o = r.body.order;
    expect(o.charges.subtotal).toBe(498);          // 2 × ₹249 from the DB
    expect(o.charges.codFee).toBe(30);
    expect(o.total).toBe(498 - 0 + 0 + 30 + 9 + Math.round(498 * 0.05));
  });

  it('decrements stock and refuses overselling', async () => {
    const before = (await request(app).get('/api/products/1')).body.stock;
    await request(app).post('/api/orders').set(auth(userToken)).send({
      items: [{ id: 1, qty: 1 }], paymentMethod: 'cod', address: { name: 'T', phone: '9' },
    });
    const after = (await request(app).get('/api/products/1')).body.stock;
    expect(after).toBe(before - 1);

    const over = await request(app).post('/api/orders').set(auth(userToken)).send({
      items: [{ id: 1, qty: 999 }], paymentMethod: 'cod', address: { name: 'T', phone: '9' },
    });
    expect(over.status).toBe(409);
  });

  it('users see only their own orders; admin sees all; status updates are admin-only', async () => {
    const mine = await request(app).get('/api/orders').set(auth(userToken));
    expect(mine.body.every((o) => o.userId === '1768813184656')).toBe(true);
    const all = await request(app).get('/api/orders').set(auth(adminToken));
    expect(all.body.length).toBeGreaterThanOrEqual(mine.body.length);

    const target = mine.body[0];
    expect((await request(app).patch(`/api/orders/${target.id}`).set(auth(userToken)).send({ status: 'Delivered' })).status).toBe(403);
    expect((await request(app).patch(`/api/orders/${target.id}`).set(auth(adminToken)).send({ status: 'Confirmed' })).status).toBe(200);
  });

  it('online payment returns a gateway order and verify marks it paid', async () => {
    const r = await request(app).post('/api/orders').set(auth(userToken)).send({
      items: [{ id: 102, qty: 1 }], paymentMethod: 'upi', address: { name: 'T', phone: '9' },
    });
    expect(r.status).toBe(201);
    expect(r.body.payment.mode).toBe('mock');
    const v = await request(app).post(`/api/orders/${r.body.order.id}/verify-payment`)
      .set(auth(userToken)).send({ paymentId: 'pay_mock_1', signature: 'mock' });
    expect(v.status).toBe(200);
    expect(v.body.order.payment.status).toBe('paid');
    expect(v.body.order.status).toBe('Confirmed');
  });
});

describe('search, sort & pagination', () => {
  it('sorts by price and paginates with X-Total-Count', async () => {
    const r = await request(app).get('/api/products?sort=price_desc&page=1&limit=5');
    expect(r.body.length).toBe(5);
    expect(Number(r.headers['x-total-count'])).toBeGreaterThanOrEqual(72);
    const prices = r.body.map((p) => p.price);
    expect([...prices].sort((a, b) => b - a)).toEqual(prices);
  });
});

describe('reviews', () => {
  it('auth required; one review per user; rating aggregates onto the product', async () => {
    expect((await request(app).post('/api/products/103/reviews').send({ rating: 5 })).status).toBe(401);

    const r = await request(app).post('/api/products/103/reviews').set(auth(userToken))
      .send({ rating: 4, comment: 'Solid product' });
    expect(r.status).toBe(201);
    expect(typeof r.body.verified).toBe('boolean');

    const dup = await request(app).post('/api/products/103/reviews').set(auth(userToken))
      .send({ rating: 5, comment: 'again' });
    expect(dup.status).toBe(409);

    const p = await request(app).get('/api/products/103');
    expect(p.body.reviews).toBe(1);
    expect(p.body.rating).toBe(4);
    expect(p.body.reviewsList.length).toBe(1);
  });

  it('buyer of the product gets a verified badge', async () => {
    // userToken bought product 1 in earlier tests
    const r = await request(app).post('/api/products/1/reviews').set(auth(userToken))
      .send({ rating: 5, comment: 'Bought it, loved it' });
    expect(r.status).toBe(201);
    expect(r.body.verified).toBe(true);
  });
});

describe('wishlist & addresses (account-synced)', () => {
  it('toggle adds then removes; GET returns full products', async () => {
    const on = await request(app).post('/api/wishlist/toggle').set(auth(userToken)).send({ productId: 102 });
    expect(on.body.added).toBe(true);
    const list = await request(app).get('/api/wishlist').set(auth(userToken));
    expect(list.body.some((p) => p.id === 102)).toBe(true);
    const off = await request(app).post('/api/wishlist/toggle').set(auth(userToken)).send({ productId: 102 });
    expect(off.body.added).toBe(false);
  });

  it('address CRUD is owner-scoped; first address becomes default', async () => {
    const c = await request(app).post('/api/addresses').set(auth(userToken))
      .send({ name: 'P', phone: '9', line1: '12 MG Road', city: 'Ahmedabad', pincode: '380001' });
    expect(c.status).toBe(201);
    expect(c.body.isDefault).toBe(true);

    const other = await request(app).post('/api/auth/signup')
      .send({ fullName: 'Other', email: `o_${Date.now()}@t.com`, password: 'secret1' });
    const otherToken = other.body.data.accessToken;
    expect((await request(app).get('/api/addresses').set(auth(otherToken))).body.length).toBe(0);
    expect((await request(app).delete(`/api/addresses/${c.body.id}`).set(auth(otherToken))).status).toBe(404);

    expect((await request(app).delete(`/api/addresses/${c.body.id}`).set(auth(userToken))).status).toBe(200);
  });
});

describe('coupons', () => {
  it('validates seeded FRESH10 with min-order enforcement', async () => {
    const ok = await request(app).post('/api/coupons/validate').set(auth(userToken))
      .send({ code: 'fresh10', subtotal: 500 });
    expect(ok.status).toBe(200);
    expect(ok.body.discount).toBe(50);

    const under = await request(app).post('/api/coupons/validate').set(auth(userToken))
      .send({ code: 'FRESH10', subtotal: 100 });
    expect(under.status).toBe(422);
  });

  it('applies server-side on orders and admin CRUD is admin-only', async () => {
    const r = await request(app).post('/api/orders').set(auth(userToken)).send({
      items: [{ id: 1, qty: 2 }], paymentMethod: 'cod', couponCode: 'FRESH10', // ₹498 ≥ ₹299 min
      address: { name: 'T', phone: '9' },
    });
    expect(r.status).toBe(201);
    expect(r.body.order.charges.discount).toBeGreaterThan(0);
    expect(r.body.order.couponCode).toBe('FRESH10');

    expect((await request(app).get('/api/coupons').set(auth(userToken))).status).toBe(403);
    const created = await request(app).post('/api/coupons').set(auth(adminToken))
      .send({ code: 'TEST20', type: 'flat', value: 20 });
    expect(created.status).toBe(201);
    expect((await request(app).delete('/api/coupons/TEST20').set(auth(adminToken))).status).toBe(200);
  });
});

describe('order lifecycle — timeline, cancel, reorder', () => {
  it('orders carry a timeline; user cancel restocks; delivered orders cannot cancel', async () => {
    const before = (await request(app).get('/api/products/104')).body.stock;
    const r = await request(app).post('/api/orders').set(auth(userToken)).send({
      items: [{ id: 104, qty: 1 }], paymentMethod: 'cod', address: { name: 'T', phone: '9' },
    });
    expect(r.body.order.timeline[0].status).toBe('Processing');

    const c = await request(app).post(`/api/orders/${r.body.order.id}/cancel`).set(auth(userToken));
    expect(c.status).toBe(200);
    expect(c.body.order.status).toBe('Cancelled');
    expect((await request(app).get('/api/products/104')).body.stock).toBe(before);

    // already cancelled → 409
    expect((await request(app).post(`/api/orders/${r.body.order.id}/cancel`).set(auth(userToken))).status).toBe(409);
  });

  it('reorder returns current products with stock-capped quantities', async () => {
    const mine = await request(app).get('/api/orders').set(auth(userToken));
    const r = await request(app).post(`/api/orders/${mine.body[0].id}/reorder`).set(auth(userToken));
    expect(r.status).toBe(200);
    expect(r.body.items.length).toBeGreaterThan(0);
    expect(r.body.items[0].product).toBeDefined();
  });
});

describe('password reset', () => {
  it('forgot returns a dev reset URL and the token actually resets the password', async () => {
    const email = `reset_${Date.now()}@t.com`;
    await request(app).post('/api/auth/signup').send({ fullName: 'R', email, password: 'oldpass1' });

    const f = await request(app).post('/api/auth/forgot-password').send({ email });
    expect(f.status).toBe(200);
    const token = new URL(f.body.devResetUrl).searchParams.get('token');

    expect((await request(app).post('/api/auth/reset-password').send({ token: 'bogus', password: 'x1234567' })).status).toBe(400);
    expect((await request(app).post('/api/auth/reset-password').send({ token, password: 'newpass1' })).status).toBe(200);
    expect((await login(email, 'oldpass1')).status).toBe(401);
    expect((await login(email, 'newpass1')).status).toBe(200);
  });
});

describe('admin surface', () => {
  it('customers list + stats are admin-only and computed from real data', async () => {
    expect((await request(app).get('/api/users').set(auth(userToken))).status).toBe(403);
    const users = await request(app).get('/api/users').set(auth(adminToken));
    expect(users.body.every((u) => u.password === undefined)).toBe(true);

    const stats = await request(app).get('/api/admin/stats').set(auth(adminToken));
    expect(stats.status).toBe(200);
    expect(stats.body.products).toBeGreaterThanOrEqual(72);
    expect(stats.body.revenue).toBeGreaterThan(0);
    expect(Array.isArray(stats.body.topProducts)).toBe(true);
  });
});
