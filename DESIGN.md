# Clovers — Design Constitution

The single source of truth for how Clovers looks and speaks. Every page, component,
and PR is audited against this file. If a screen violates a rule here, the screen
is wrong — not the rule (change the rule first, deliberately, in this file).

Subject: a quick-commerce grocery store for Indian households. The design's job is
to make picking 15 items feel effortless and to make the store feel *operated* —
stocked shelves, honest prices, a courier already waiting. Never decorative for
decoration's sake.

## 1. Color — three inks, each with one meaning

| Token        | Hex       | Meaning — and the ONLY thing it may say                          |
|--------------|-----------|------------------------------------------------------------------|
| brand-red    | `#dc2626` | Identity: logo, active nav item, marketing CTAs (hero, banners)   |
| commerce-green | `#16a34a` | Money-forward action & good news: ADD/steppers, cart, checkout CTA, FREE delivery, rating chip, "in stock" |
| info-blue    | `#256fef` | Neutral facts: % OFF ribbon, "saved ₹x" chip                      |
| ink          | `#111827` | Primary text                                                      |
| muted        | `#6b7280` | Secondary text, units, timestamps                                 |
| line         | `#ececec` | Hairline borders; `#f5f6f8` app background, `#fff` cards          |

Rules:
- Red never sells (no red ADD/price/checkout buttons). Green never brands.
- Semantic states (error `#dc2626` text-on-red-50, warning amber, success green)
  are separate from the accents above and appear only on actual states.
- No gradients on UI controls. Gradients allowed only inside marketing banners.

## 2. Type

- Display: **Playfair Display** — logo and section headings ONLY (`h1/h2` of
  marketing surfaces). Never in cards, buttons, forms, tables.
- UI/body: system sans stack. Sizes: 11 (fine print) / 12.5–13 (card meta) /
  14 (body) / 15–17 (section) / 22+ (page titles). No sizes outside the scale.
- Sentence case everywhere. UPPERCASE only for ≤2-word chips ("ADD", "% OFF",
  payment badges) with slight letter-spacing.

## 3. Layout

- **Fluid full-width.** No `max-w-*xl mx-auto` page gutters, ever. Side padding
  only: 16px mobile → 24px md → 32px xl (the `.container` config).
- Product grid: `repeat(auto-fill, minmax(178px, 1fr))`, 14px gap.
- Shelves scroll horizontally with snap; arrows + "See all" on the right.
- Cards: white, 1px `line` border, radius 12–14px. Shadow only on hover (soft,
  ≤ 24px blur). Controls radius 8px.
- One `Header` (delivery promise + search + cart pill) and one `Footer` on every
  storefront page. Admin uses its own shell.

## 4. Commerce surfaces (the product card is the atom)

- Every product render goes through `ProductCard` — no bespoke card markup.
- Card anatomy top→bottom: image on white (contain, blend-multiply), % OFF ribbon
  (only when a real MRP exists), wishlist heart, unit line, 2-line name, rating
  chip (only when reviews > 0), price + struck MRP, ADD → qty stepper.
- Prices always `₹` integer. MRP only when `originalPrice > price`. Never "$".
- Out of stock: dark chip on image + disabled "Sold out" — never hidden.

## 5. Voice

- Indian context: ₹, pincode, UPI/COD, "Delivery in 10 minutes".
- Buttons say exactly what happens: "Proceed to Checkout", "Place Order",
  "Cancel Order". The toast confirms in the same words.
- Errors say what went wrong + what to do ("Add items worth ₹120 more to use
  FRESH10"). No apologies, no "Oops".
- Form fields have real labels/placeholders ("Full name", "Pincode") — never raw
  key names ("firstName", "zip").
- Empty states = an invitation with one action button, not a sad message.

## 6. Motion & quality floor

- Micro only: 150–300ms ease; card hover lift ≤ 2px; drawer 300ms slide.
- No parallax, no WebGL, no confetti storms (a single success burst is allowed).
- Skeletons for loading lists; never spinner-only full pages.
- Images: lazy-load, and ALWAYS an `onError` fallback (the gray SVG) — broken
  alt-text is a release blocker.
- Keyboard focus visible; `prefers-reduced-motion` respected for anything larger
  than a hover.

## 7. Trust details (the "sellable product" bar)

- Tab: title + 🍀 favicon set; no dev-server defaults anywhere.
- Footer: real company block (Pvt. Ltd., toll-free, .in email, Indian address),
  payments strip, dynamic © year.
- Order lifecycle must read coherently end-to-end: promise ("10 minutes") →
  checkout ETA → success page → tracking timeline. No contradicting ETAs.
