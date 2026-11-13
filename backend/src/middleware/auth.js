import { jwt } from 'hono/jwt';
import { ApiError } from '../lib/errors.js';

/** Guards every /admin route: valid HS256 token + role "admin", and never cached. */
export const adminAuth = async (c, next) => {
  if (!c.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    throw new ApiError(500, 'Server is not configured');
  }
  return jwt({ secret: c.env.JWT_SECRET, alg: 'HS256' })(c, async () => {
    if (c.get('jwtPayload')?.role !== 'admin') throw new ApiError(403, 'Forbidden');
    await next();
    c.header('Cache-Control', 'no-store');
  });
};
