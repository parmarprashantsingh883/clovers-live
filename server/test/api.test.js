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
