import User from '../models/User.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';
import {
  signAccessToken, signRefreshToken, verifyRefreshToken, sha256,
  REFRESH_COOKIE, refreshCookieOptions,
} from '../lib/jwt.js';

async function issueTokens(res, user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = sha256(refreshToken);
  await user.save({ validateBeforeSave: false });
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  return accessToken;
}

/** POST /auth/signup — creates a customer account. */
export const signup = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  if (!fullName || !email || !password) throw new ApiError(400, 'Name, email and password are required');
  if (String(password).length < 6) throw new ApiError(422, 'Password must be at least 6 characters');
  if (await User.findOne({ email: String(email).toLowerCase() })) throw new ApiError(409, 'An account with this email already exists');
  const user = await User.create({ fullName, email, phone, password, role: 'user' });
  const accessToken = await issueTokens(res, user);
  res.status(201).json({ success: true, data: { user, accessToken } });
});

const doLogin = (wantRole) => asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password || ''))) throw new ApiError(401, 'Invalid email or password');
  if (user.status !== 'active') throw new ApiError(403, 'Account is blocked — contact support');
  if (wantRole && user.role !== wantRole) throw new ApiError(403, 'Not authorized for this area');
  const accessToken = await issueTokens(res, user);
  res.json({ success: true, data: { user, accessToken } });
});

/** POST /auth/login (customers) · POST /auth/admin/login (admins) */
export const login = doLogin('user');
export const adminLogin = doLogin('admin');

/** POST /auth/refresh */
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new ApiError(401, 'No refresh token');
  let decoded;
  try { decoded = verifyRefreshToken(token); } catch { throw new ApiError(401, 'Refresh token expired — log in again'); }
  const user = await User.findOne({ id: decoded.id }).select('+refreshTokenHash');
  if (!user || user.refreshTokenHash !== sha256(token)) throw new ApiError(401, 'Refresh token revoked — log in again');
  const accessToken = await issueTokens(res, user);
  res.json({ success: true, data: { user, accessToken } });
});

/** POST /auth/logout */
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try { const d = verifyRefreshToken(token); await User.updateOne({ id: d.id }, { $unset: { refreshTokenHash: 1 } }); } catch { /* noop */ }
  }
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.json({ success: true, message: 'Logged out' });
});

/** GET /auth/me */
export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});
