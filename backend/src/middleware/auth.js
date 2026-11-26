import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Sign in to continue.' });
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET); }
  catch { return res.status(401).json({ message: 'Your session expired. Please sign in again.' }); }
  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ message: 'Account not found.' });
  req.user = user;
  next();
});

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'You do not have permission to do that.' });
  next();
};
