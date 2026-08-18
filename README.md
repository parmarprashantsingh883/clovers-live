# 🍀 Clovers — Grocery E-commerce

Full-stack grocery storefront + admin back office. React storefront with cart,
checkout and order tracking; a real Express + MongoDB API with JWT auth,
server-authoritative pricing, stock control and role-based admin.

## Stack

| Layer | Tech |
|---|---|
| Storefront + Admin | React 18 · Vite · TypeScript · Tailwind · shadcn-ui |
| API | Express 4 · Mongoose 8 · JWT (access + httpOnly refresh) · bcrypt |
| Payments | Razorpay adapter — mock gateway by default, live with keys |
| Dev DB | In-memory MongoDB, auto-seeded (zero setup) · Atlas in prod |

## Run it

```sh
# 1) API (port 5000) — in-memory Mongo + seed, no setup needed
cd server && cp .env.example .env && npm i && npm run dev

# 2) Storefront + admin (port 5001, proxies /api → 5000)
npm i && npm run dev
```

- Storefront → http://localhost:5001 — user: `parmarprashantsingh883@gmail.com` / `123456`
- Admin → http://localhost:5001/admin/login — `admin@gmail.com` / `admin123`

## What makes it real (not a mock)

- **Real auth** — bcrypt-hashed passwords, JWT access + rotating httpOnly
  refresh cookie, silent session restore; separate role-gated admin login;
  blocked accounts can't sign in.
- **Server-authoritative orders** — prices always come from the database
  (client price tampering is ignored), stock is checked and decremented
  race-safely, overselling returns 409, totals (delivery / COD fee /
  convenience / GST / coupon) are computed server-side and stored as a
  `charges` breakdown.
- **Payments** — create → pay → verify flow against Razorpay; runs in mock
  mode with zero config so checkout works end-to-end locally.
- **Scoped data** — users see only their own orders; product/category writes,
  customer management and stats are admin-only.
- **Live back office** — dashboard revenue/orders/customers/top-sellers,
  order-status lifecycle (Processing → Confirmed → Shipped → Delivered /
  Cancelled), customer block/unblock, analytics chart — all from the DB.
- **Security** — helmet, CORS allowlist, rate limits (stricter on auth),
  NoSQL-operator sanitization, env validation that fails fast in prod.
- **Tests** — vitest + supertest API suite (auth, RBAC, pricing, stock,
  payments): `cd server && npm test`.

## Deploy

- **API**: any Node host (Render/Railway). Set `NODE_ENV=production`,
  `MONGO_URI` (Atlas), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
  `CLIENT_URL` (your web origin), and Razorpay keys for live payments.
- **Web**: static host (Vercel/Netlify). Set `VITE_API_URL=https://<api>/api`.

> `Backend/` is the original json-server mock — kept only as the seed data
> source (`server/src/seed` imports its `db.json`). The app no longer runs on it.
