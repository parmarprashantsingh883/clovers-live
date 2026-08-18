import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const signAccessToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });

export const signRefreshToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });

export const verifyAccessToken = (t) => jwt.verify(t, process.env.JWT_ACCESS_SECRET);
export const verifyRefreshToken = (t) => jwt.verify(t, process.env.JWT_REFRESH_SECRET);
export const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');

export const REFRESH_COOKIE = 'clv_refresh';
export const refreshCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};
