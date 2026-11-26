import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { refreshCookieOptions, signAccessToken, signRefreshToken } from '../utils/tokens.js';

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const issueSession = async (user, res) => {
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hash(refreshToken);
  await user.save({ validateBeforeSave: false });
  res.cookie('refreshToken', refreshToken, refreshCookieOptions());
  return signAccessToken(user);
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  const user = await User.create({ name, email, password, role: 'student' });
  const accessToken = await issueSession(user, res);
  res.status(201).json({ accessToken, user: user.toSafeJSON() });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase().trim() }).select('+password');
  if (!user || !password || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  const accessToken = await issueSession(user, res);
  res.json({ accessToken, user: user.toSafeJSON() });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET); }
  catch { return res.status(401).json({ message: 'Session expired. Please sign in again.' }); }
  const user = await User.findById(payload.sub).select('+refreshTokenHash');
  if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hash(token)) return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  const accessToken = await issueSession(user, res);
  res.json({ accessToken, user: user.toSafeJSON() });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(payload.sub, { refreshTokenHash: null });
    } catch { /* Expired token: clearing the cookie is enough. */ }
  }
  res.clearCookie('refreshToken', { ...refreshCookieOptions(), maxAge: undefined });
  res.json({ message: 'Signed out.' });
});

export const me = asyncHandler(async (req, res) => res.json({ user: req.user.toSafeJSON() }));

export const createLibrarian = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  const librarian = await User.create({ name, email, password, role: 'librarian' });
  res.status(201).json({ user: librarian.toSafeJSON() });
});

export const listLibrarians = asyncHandler(async (req, res) => {
  const librarians = await User.find({ role: 'librarian' }).sort({ name: 1 });
  res.json({ librarians: librarians.map((user) => user.toSafeJSON()) });
});
