import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { onError } from './lib/errors.js';
import { adminAuth } from './middleware/auth.js';
import adminMedia from './routes/admin/media.js';
import adminProfile from './routes/admin/profile.js';
import adminProjects from './routes/admin/projects.js';
import adminSocial from './routes/admin/social.js';
import auth from './routes/auth.js';
import media from './routes/media.js';
import pub from './routes/public.js';

const app = new Hono();

// Security header for every response.
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
});

// Allowed browser origins come from the ALLOWED_ORIGINS variable (comma separated, see wrangler.jsonc).
app.use('*', (c, next) => {
  const allowed = (c.env.ALLOWED_ORIGINS ?? '').split(',').map((origin) => origin.trim()).filter(Boolean);
  return cors({
    origin: (origin) => (allowed.includes(origin) ? origin : null),
    allowMethods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type'],
    exposeHeaders: ['Content-Range', 'Accept-Ranges', 'ETag'],
    maxAge: 86400,
  })(c, next);
});

// Public
app.route('/', pub);
app.route('/', media);
app.route('/', auth);

// Admin: one guard in front of everything mounted under /admin
const admin = new Hono();
admin.use('*', adminAuth);
admin.route('/profile', adminProfile);
admin.route('/social-links', adminSocial);
admin.route('/projects', adminProjects);
admin.route('/media', adminMedia);
app.route('/admin', admin);

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError(onError);

export default app;
