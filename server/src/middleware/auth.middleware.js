import User from '../models/User.js';
import { verifyAccessToken } from '../lib/jwt.js';
import { ApiError, asyncHandler } from './error.middleware.js';

/** Require a valid access token; attach req.user (the User doc). */
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Not authenticated');
  let decoded;
  try { decoded = verifyAccessToken(token); }
  catch { throw new ApiError(401, 'Session expired — please log in again'); }
  const user = await User.findOne({ id: decoded.id });
  if (!user || user.status !== 'active') throw new ApiError(401, 'Account not found or blocked');
  req.user = user;
  next();
});

/** Require an admin (use after protect). */
export const adminOnly = (req, _res, next) => {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Admin access required'));
  next();
};
