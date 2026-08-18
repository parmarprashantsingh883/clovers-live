import crypto from 'crypto';

/**
 * Payment gateway adapter — same mock-first pattern as Quarters.
 * With RAZORPAY_KEY_ID/SECRET → real Razorpay orders + HMAC verify.
 * Without (dev default) → mock mode: the full create → pay → verify flow works
 * end-to-end locally with a simulated gateway.
 */
const isLive = () => !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;
async function getRazorpay() {
  if (razorpay) return razorpay;
  const Razorpay = (await import('razorpay')).default;
  razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  return razorpay;
}

export async function createGatewayOrder({ amountInRupees, receiptId }) {
  if (isLive()) {
    const rp = await getRazorpay();
    const order = await rp.orders.create({ amount: Math.round(amountInRupees * 100), currency: 'INR', receipt: receiptId });
    return { mode: 'live', keyId: process.env.RAZORPAY_KEY_ID, order };
  }
  return {
    mode: 'mock',
    keyId: 'rzp_test_mock',
    order: { id: `order_mock_${crypto.randomBytes(8).toString('hex')}`, amount: Math.round(amountInRupees * 100), currency: 'INR', receipt: receiptId, status: 'created' },
  };
}

export function verifySignature({ orderId, paymentId, signature }) {
  if (!isLive()) return !!paymentId; // mock: any non-empty payment id passes
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`).digest('hex');
  return expected === signature;
}

export const paymentMode = () => (isLive() ? 'live' : 'mock');
