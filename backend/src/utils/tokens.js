import jwt from 'jsonwebtoken';

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, name: user.name }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TTL || '15m' });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_TTL || '7d' });
}

export function refreshCookieOptions() {
  const days = Number(process.env.REFRESH_COOKIE_DAYS || 7);
  const production = process.env.NODE_ENV === 'production';
  return { httpOnly: true, secure: production, sameSite: production ? 'none' : 'strict', path: '/api/auth', maxAge: days * 24 * 60 * 60 * 1000 };
}
