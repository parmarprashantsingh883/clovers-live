/**
 * Transactional email — mock-first like the payment adapter.
 * With SMTP_* env set → real mail via nodemailer (lazy import).
 * Without → logs to console so every flow works locally with zero config.
 */
const isLive = () => !!process.env.SMTP_HOST && !!process.env.SMTP_USER;

let transporter = null;
async function getTransporter() {
  if (transporter) return transporter;
  const nodemailer = (await import('nodemailer')).default;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  if (!isLive()) {
    if (process.env.NODE_ENV !== 'test') console.log(`📧 [mock email] to=${to} · ${subject}`);
    return { mode: 'mock' };
  }
  const t = await getTransporter();
  await t.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, html });
  return { mode: 'live' };
}

export const emailMode = () => (isLive() ? 'live' : 'mock');

const inr = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

export const templates = {
  orderConfirmed: (order) => ({
    subject: `Order ${order.id} confirmed — Clovers`,
    html: `<h2>Thanks for your order!</h2>
      <p>Order <b>${order.id}</b> · ${order.items.length} item(s) · <b>${inr(order.total)}</b></p>
      <p>Paying by ${String(order.paymentMethod).toUpperCase()}. We'll email you as it moves.</p>`,
  }),
  orderStatus: (order) => ({
    subject: `Order ${order.id} is now ${order.status} — Clovers`,
    html: `<p>Your order <b>${order.id}</b> is now <b>${order.status}</b>.</p>`,
  }),
  resetPassword: (name, link) => ({
    subject: 'Reset your Clovers password',
    html: `<p>Hi ${name},</p><p><a href="${link}">Click here to reset your password</a>. The link expires in 30 minutes. If you didn't ask for this, ignore this email.</p>`,
  }),
};
