import { HTTPException } from 'hono/http-exception';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFound = (what = 'Not found') => new ApiError(404, what);

export function onError(err, c) {
  if (err instanceof ApiError) {
    if (err.status === 429 && err.retryAfter) c.header('Retry-After', String(err.retryAfter));
    return c.json({ error: err.message, details: err.details }, err.status);
  }
  if (err instanceof HTTPException) {
    return c.json({ error: err.message || 'Request error' }, err.status);
  }
  if (/UNIQUE constraint failed/i.test(err?.message ?? '')) {
    return c.json({ error: 'A record with this unique value (for example the slug) already exists' }, 409);
  }
  console.error('Unhandled error:', err?.stack ?? err);
  return c.json({ error: 'Internal server error' }, 500);
}
