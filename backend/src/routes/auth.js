import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { z } from 'zod';
import { LOGIN } from '../config.js';
import { ApiError } from '../lib/errors.js';
import { validate } from '../middleware/validate.js';

const auth = new Hono();

// Hash both sides so lengths match, then compare in constant time.
async function passwordMatches(input, expected) {
  if (!expected) return false;
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(input)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}

auth.post('/login', validate('json', z.object({ password: z.string().min(1).max(200) })), async (c) => {
  const db = c.env.portfolio_db;
  const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
  const now = Math.floor(Date.now() / 1000);

  const attempt = await db.prepare('SELECT failures, locked_until FROM login_attempts WHERE ip = ?').bind(ip).first();
  if (attempt && attempt.locked_until > now) {
    const error = new ApiError(429, 'Too many failed attempts. Try again later.');
    error.retryAfter = attempt.locked_until - now;
    throw error;
  }

  const { password } = c.req.valid('json');
  if (!(await passwordMatches(password, c.env.ADMIN_PASSWORD))) {
    const failures = (attempt?.failures ?? 0) + 1;
    const lock = failures >= LOGIN.maxFailures;
    await db
      .prepare(
        `INSERT INTO login_attempts (ip, failures, locked_until, updated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(ip) DO UPDATE SET failures = excluded.failures, locked_until = excluded.locked_until, updated_at = excluded.updated_at`,
      )
      .bind(ip, lock ? 0 : failures, lock ? now + LOGIN.lockSeconds : 0, now)
      .run();
    throw new ApiError(401, 'Invalid password');
  }

  if (attempt) await db.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip).run();

  const token = await sign({ role: 'admin', iat: now, exp: now + LOGIN.tokenTtlSeconds }, c.env.JWT_SECRET);
  return c.json({ token, expiresIn: LOGIN.tokenTtlSeconds });
});

export default auth;
