import User from '../models/User.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';

/** GET /api/users (admin) — customer list, json-server-shaped. */
export const listUsers = asyncHandler(async (_req, res) => {
  res.json(await User.find({ role: 'user' }).sort({ createdAt: -1 }));
});

/** PATCH /api/users/:id (admin) — block/unblock. */
export const updateUser = asyncHandler(async (req, res) => {
  const patch = {};
  if (req.body?.status && ['active', 'blocked'].includes(req.body.status)) patch.status = req.body.status;
  const user = await User.findOneAndUpdate({ id: req.params.id, role: 'user' }, patch, { new: true });
  if (!user) throw new ApiError(404, 'Customer not found');
  res.json(user);
});

/** PUT /api/users/me — self profile update (name/phone). */
export const updateMe = asyncHandler(async (req, res) => {
  if (req.body?.fullName) req.user.fullName = String(req.body.fullName).trim();
  if (req.body?.phone !== undefined) req.user.phone = String(req.body.phone).trim();
  await req.user.save({ validateBeforeSave: false });
  res.json({ success: true, data: { user: req.user } });
});
