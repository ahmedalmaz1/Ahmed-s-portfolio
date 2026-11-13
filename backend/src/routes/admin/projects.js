import { Hono } from 'hono';
import { LIMITS } from '../../config.js';
import { nextSortOrder, pickColumns, reorder } from '../../lib/db.js';
import { ApiError, notFound } from '../../lib/errors.js';
import { assertMediaExists, deleteMedia, mediaBase } from '../../lib/media.js';
import { SQL } from '../../lib/queries.js';
import { serializeImage, serializeProject } from '../../lib/serializers.js';
import { validate } from '../../middleware/validate.js';
import { idParam, reorderSchema } from '../../schemas/common.js';
import { PROJECT_COLUMNS, imageCreateSchema, imageUpdateSchema, projectCreateSchema, projectUpdateSchema } from '../../schemas/project.js';

const projects = new Hono();

async function loadProject(db, id, base) {
	const [project, images] = await db.batch([db.prepare(SQL.projectById).bind(id), db.prepare(SQL.imagesByProjectId).bind(id)]);
	const row = project.results[0];
	if (!row) throw notFound('Project not found');
	return { ...serializeProject(row, base), images: images.results.map((image) => serializeImage(image, base)) };
}

// ---- projects

projects.get('/', async (c) => {
	const { results } = await c.env.portfolio_db.prepare(SQL.allProjects).all(); // includes unpublished
	const base = mediaBase(c);
	return c.json(results.map((row) => serializeProject(row, base)));
});

projects.put('/reorder', validate('json', reorderSchema), async (c) => {
	const db = c.env.portfolio_db;
	const { ids } = c.req.valid('json');
	if (!(await reorder(db, 'projects', ids))) throw new ApiError(400, 'One or more ids do not exist');
	const { results } = await db.prepare(SQL.allProjects).all();
	const base = mediaBase(c);
	return c.json(results.map((row) => serializeProject(row, base)));
});

projects.get('/:id{[0-9]+}', validate('param', idParam), async (c) => {
	const { id } = c.req.valid('param');
	return c.json(await loadProject(c.env.portfolio_db, id, mediaBase(c)));
});

projects.post('/', validate('json', projectCreateSchema), async (c) => {
	const db = c.env.portfolio_db;
	const body = c.req.valid('json');
	await assertMediaExists(c.env, [body.posterKey, body.posterThumbKey]);

	if (body.published === undefined) body.published = 1;
	if (body.sortOrder === undefined) body.sortOrder = await nextSortOrder(db, 'projects');

	const { columns, values } = pickColumns(body, PROJECT_COLUMNS);
	const result = await db
		.prepare(`INSERT INTO projects (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`)
		.bind(...values)
		.run();
	return c.json(await loadProject(db, result.meta.last_row_id, mediaBase(c)), 201);
});

projects.patch('/:id{[0-9]+}', validate('param', idParam), validate('json', projectUpdateSchema), async (c) => {
	const db = c.env.portfolio_db;
	const { id } = c.req.valid('param');
	const body = c.req.valid('json');

	const old = await db.prepare(SQL.projectById).bind(id).first();
	if (!old) throw notFound('Project not found');
	await assertMediaExists(c.env, [body.posterKey, body.posterThumbKey]);

	const { columns, values } = pickColumns(body, PROJECT_COLUMNS);
	await db
		.prepare(`UPDATE projects SET ${columns.map((column) => `${column} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
		.bind(...values, id)
		.run();

	const updated = await db.prepare(SQL.projectById).bind(id).first();
	const keep = new Set([updated.poster_key, updated.poster_thumb_key]);
	await deleteMedia(
		c.env,
		[old.poster_key, old.poster_thumb_key].filter((key) => key && !keep.has(key)),
	);

	return c.json(await loadProject(db, id, mediaBase(c)));
});

projects.delete('/:id{[0-9]+}', validate('param', idParam), async (c) => {
	const db = c.env.portfolio_db;
	const { id } = c.req.valid('param');
	const [project, images] = await db.batch([db.prepare(SQL.projectById).bind(id), db.prepare(SQL.imagesByProjectId).bind(id)]);
	const row = project.results[0];
	if (!row) throw notFound('Project not found');

	await db.prepare('DELETE FROM projects WHERE id = ?').bind(id).run(); // images are removed by ON DELETE CASCADE
	await deleteMedia(c.env, [
		row.poster_key,
		row.poster_thumb_key,
		...images.results.flatMap((image) => [image.image_key, image.thumb_key]),
	]);
	return c.json({ ok: true });
});

// ---- gallery images
projects.post('/:id{[0-9]+}/images', validate('param', idParam), validate('json', imageCreateSchema), async (c) => {
	const db = c.env.portfolio_db;
	const { id } = c.req.valid('param');
	const body = c.req.valid('json');

	if (!(await db.prepare(SQL.projectById).bind(id).first())) throw notFound('Project not found');
	const count = await db.prepare('SELECT COUNT(*) AS n FROM project_images WHERE project_id = ?').bind(id).first('n');
	if (count >= LIMITS.imagesPerProject) throw new ApiError(400, `A project can have up to ${LIMITS.imagesPerProject} images`);
	await assertMediaExists(c.env, [body.imageKey, body.thumbKey]);

	const sortOrder = await nextSortOrder(db, 'project_images', { column: 'project_id', value: id });
	const result = await db
		.prepare('INSERT INTO project_images (project_id, image_key, thumb_key, width, height, alt, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)')
		.bind(id, body.imageKey, body.thumbKey ?? null, body.width ?? null, body.height ?? null, body.alt ?? '', sortOrder)
		.run();
	const row = await db.prepare(SQL.imageById).bind(result.meta.last_row_id).first();
	return c.json(serializeImage(row, mediaBase(c)), 201);
});

projects.put('/:id{[0-9]+}/images/reorder', validate('param', idParam), validate('json', reorderSchema), async (c) => {
	const db = c.env.portfolio_db;
	const { id } = c.req.valid('param');
	const { ids } = c.req.valid('json');
	if (!(await reorder(db, 'project_images', ids, { column: 'project_id', value: id }))) {
		throw new ApiError(400, 'One or more image ids do not belong to this project');
	}
	const { results } = await db.prepare(SQL.imagesByProjectId).bind(id).all();
	const base = mediaBase(c);
	return c.json(results.map((image) => serializeImage(image, base)));
});

projects.patch('/images/:id{[0-9]+}', validate('param', idParam), validate('json', imageUpdateSchema), async (c) => {
	const db = c.env.portfolio_db;
	const { id } = c.req.valid('param');
	const result = await db.prepare('UPDATE project_images SET alt = ? WHERE id = ?').bind(c.req.valid('json').alt, id).run();
	if (result.meta.changes === 0) throw notFound('Image not found');
	return c.json(serializeImage(await db.prepare(SQL.imageById).bind(id).first(), mediaBase(c)));
});

projects.delete('/images/:id{[0-9]+}', validate('param', idParam), async (c) => {
	const db = c.env.portfolio_db;
	const { id } = c.req.valid('param');
	const row = await db.prepare(SQL.imageById).bind(id).first();
	if (!row) throw notFound('Image not found');
	await db.prepare('DELETE FROM project_images WHERE id = ?').bind(id).run();
	await deleteMedia(c.env, [row.image_key, row.thumb_key]);
	return c.json({ ok: true });
});

export default projects;
