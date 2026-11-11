import { Hono } from 'hono';
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

export default app;
