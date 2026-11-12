import { Hono } from 'hono';
import { jwt, sign } from 'hono/jwt';
import { cors } from 'hono/cors';

const app = new Hono();

app.use(
	'*',
	cors({
		origin: ['http://localhost:3000', 'https://ahmed-s-portfolio-pied.vercel.app'],
	}),
);

app.get('/', (c) => c.json({ ok: true }));

app.get('/profile', async (c) => {
	const row = await c.env.portfolio_db.prepare('SELECT * FROM profile WHERE id = 1').first();
	return c.json(row);
});

app.get('/social-links', async (c) => {
	const { results } = await c.env.portfolio_db.prepare('SELECT * FROM social_links ORDER BY sort_order ASC').all();
	return c.json(results);
});

app.get('/projects', async (c) => {
	const { results } = await c.env.portfolio_db.prepare('SELECT * FROM projects WHERE published = 1 ORDER BY sort_order ASC').all();
	return c.json(results.map((p) => ({ ...p, toolkit: JSON.parse(p.toolkit || '[]') })));
});

app.get('/projects/:slug', async (c) => {
	const db = c.env.portfolio_db;
	const project = await db.prepare('SELECT * FROM projects WHERE slug = ? AND published = 1').bind(c.req.param('slug')).first();
	if (!project) return c.json({ error: 'Not found' }, 404);

	const { results: images } = await db
		.prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC')
		.bind(project.id)
		.all();

	return c.json({ ...project, toolkit: JSON.parse(project.toolkit || '[]'), images });
});

const safeEqual = (a, b) => {
	if (a.length !== b.length) return false;
	let r = 0;
	for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return r === 0;
};

app.get('/media/*', async (c) => {
	const key = decodeURIComponent(c.req.path.replace('/media/', ''));
	const obj = await c.env.MEDIA.get(key);
	if (!obj) return c.notFound();
	return c.body(obj.body, 200, {
		'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
		'Cache-Control': 'public, max-age=31536000, immutable',
		ETag: obj.httpEtag,
	});
});

app.post('/login', async (c) => {
	const { password } = await c.req.json().catch(() => ({}));
	if (!password || !safeEqual(password, c.env.ADMIN_PASSWORD)) return c.json({ error: 'Invalid password' }, 401);
	const token = await sign({ role: 'admin', exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12 }, c.env.JWT_SECRET);
	return c.json({ token });
});

app.use('/admin/*', (c, next) => jwt({ secret: c.env.JWT_SECRET, alg: 'HS256' })(c, next));

app.put('/admin/profile', async (c) => {
	const b = await c.req.json();
	await c.env.portfolio_db
		.prepare('UPDATE profile SET name=?, bio=?, email=?, showreel_url=?, avatar_key=?, updated_at=CURRENT_TIMESTAMP WHERE id=1')
		.bind(b.name ?? null, b.bio ?? null, b.email ?? null, b.showreel_url ?? null, b.avatar_key ?? null)
		.run();
	return c.json({ ok: true });
});

app.post('/admin/social-links', async (c) => {
	const b = await c.req.json();
	const r = await c.env.portfolio_db
		.prepare('INSERT INTO social_links (platform, url, sort_order) VALUES (?, ?, ?)')
		.bind(b.platform, b.url, b.sort_order ?? 0)
		.run();
	return c.json({ id: r.meta.last_row_id }, 201);
});

app.put('/admin/social-links/:id', async (c) => {
	const b = await c.req.json();
	await c.env.portfolio_db
		.prepare('UPDATE social_links SET platform=?, url=?, sort_order=? WHERE id=?')
		.bind(b.platform, b.url, b.sort_order ?? 0, c.req.param('id'))
		.run();
	return c.json({ ok: true });
});

app.delete('/admin/social-links/:id', async (c) => {
	await c.env.portfolio_db.prepare('DELETE FROM social_links WHERE id=?').bind(c.req.param('id')).run();
	return c.json({ ok: true });
});

app.get('/admin/projects', async (c) => {
	const { results } = await c.env.portfolio_db.prepare('SELECT * FROM projects ORDER BY sort_order ASC').all();
	return c.json(results.map((p) => ({ ...p, toolkit: JSON.parse(p.toolkit || '[]') })));
});

app.post('/admin/projects', async (c) => {
	const b = await c.req.json();
	const r = await c.env.portfolio_db
		.prepare(
			'INSERT INTO projects (slug, title, description, toolkit, youtube_url, cover_key, sort_order, published) VALUES (?,?,?,?,?,?,?,?)',
		)
		.bind(
			b.slug,
			b.title,
			b.description ?? null,
			JSON.stringify(b.toolkit ?? []),
			b.youtube_url ?? null,
			b.cover_key ?? null,
			b.sort_order ?? 0,
			b.published ?? 1,
		)
		.run();
	return c.json({ id: r.meta.last_row_id }, 201);
});

app.put('/admin/projects/:id', async (c) => {
	const b = await c.req.json();
	await c.env.portfolio_db
		.prepare(
			'UPDATE projects SET slug=?, title=?, description=?, toolkit=?, youtube_url=?, cover_key=?, sort_order=?, published=? WHERE id=?',
		)
		.bind(
			b.slug,
			b.title,
			b.description ?? null,
			JSON.stringify(b.toolkit ?? []),
			b.youtube_url ?? null,
			b.cover_key ?? null,
			b.sort_order ?? 0,
			b.published ?? 1,
			c.req.param('id'),
		)
		.run();
	return c.json({ ok: true });
});

app.delete('/admin/projects/:id', async (c) => {
	const db = c.env.portfolio_db;
	const id = c.req.param('id');
	const { results } = await db.prepare('SELECT image_key FROM project_images WHERE project_id=?').bind(id).all();
	const project = await db.prepare('SELECT cover_key FROM projects WHERE id=?').bind(id).first();
	const keys = results.map((r) => r.image_key);
	if (project?.cover_key) keys.push(project.cover_key);
	if (keys.length) await c.env.MEDIA.delete(keys);
	await db.prepare('DELETE FROM projects WHERE id=?').bind(id).run();
	return c.json({ ok: true });
});

const MAX_IMAGE = 10 * 1024 * 1024;
const IMAGE_TYPES = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/avif': 'avif',
	'image/gif': 'gif',
};

app.post('/admin/upload', async (c) => {
	const form = await c.req.formData();
	const file = form.get('file');
	const folder = (form.get('folder') || 'misc').toString().replace(/[^a-z0-9-]/gi, '');
	if (!file || typeof file === 'string') return c.json({ error: 'No file' }, 400);
	const ext = IMAGE_TYPES[file.type];
	if (!ext) return c.json({ error: 'Unsupported file type' }, 400);
	if (file.size > MAX_IMAGE) return c.json({ error: 'File too large (max 10MB)' }, 413);
	const key = `${folder}/${crypto.randomUUID()}.${ext}`;
	await c.env.MEDIA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
	return c.json({ key }, 201);
});

app.post('/admin/projects/:id/images', async (c) => {
	const b = await c.req.json();
	const r = await c.env.portfolio_db
		.prepare('INSERT INTO project_images (project_id, image_key, alt, sort_order) VALUES (?,?,?,?)')
		.bind(c.req.param('id'), b.image_key, b.alt ?? null, b.sort_order ?? 0)
		.run();
	return c.json({ id: r.meta.last_row_id }, 201);
});

app.delete('/admin/project-images/:id', async (c) => {
	const db = c.env.portfolio_db;
	const row = await db.prepare('SELECT image_key FROM project_images WHERE id=?').bind(c.req.param('id')).first();
	if (row) await c.env.MEDIA.delete(row.image_key);
	await db.prepare('DELETE FROM project_images WHERE id=?').bind(c.req.param('id')).run();
	return c.json({ ok: true });
});

export default app;
