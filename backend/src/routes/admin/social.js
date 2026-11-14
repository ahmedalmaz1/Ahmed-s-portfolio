import { Hono } from 'hono';
import { LIMITS } from '../../config.js';
import { nextSortOrder, pickColumns, reorder } from '../../lib/db.js';
import { ApiError, notFound } from '../../lib/errors.js';
import { SQL } from '../../lib/queries.js';
import { serializeSocial } from '../../lib/serializers.js';
import { validate } from '../../middleware/validate.js';
import { idParam, reorderSchema } from '../../schemas/common.js';
import { SOCIAL_COLUMNS, socialCreateSchema, socialUpdateSchema } from '../../schemas/social.js';

const social = new Hono();

social.get('/', async (c) => {
  const { results } = await c.env.portfolio_db.prepare(SQL.social).all();
  return c.json(results.map(serializeSocial));
});

social.put('/reorder', validate('json', reorderSchema), async (c) => {
  const { ids } = c.req.valid('json');
  const ok = await reorder(c.env.portfolio_db, 'social_links', ids);
  if (!ok) throw new ApiError(400, 'One or more ids do not exist');
  const { results } = await c.env.portfolio_db.prepare(SQL.social).all();
  return c.json(results.map(serializeSocial));
});

social.post('/', validate('json', socialCreateSchema), async (c) => {
  const db = c.env.portfolio_db;
  const body = c.req.valid('json');

  const count = await db.prepare('SELECT COUNT(*) AS n FROM social_links').first('n');
  if (count >= LIMITS.socialLinksMax) {
    throw new ApiError(400, `You can add up to ${LIMITS.socialLinksMax} social links`);
  }
  if (body.sortOrder === undefined) body.sortOrder = await nextSortOrder(db, 'social_links');

  const { columns, values } = pickColumns(body, SOCIAL_COLUMNS);
  const result = await db
    .prepare(`INSERT INTO social_links (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`)
    .bind(...values)
    .run();
  const row = await db.prepare(SQL.socialById).bind(result.meta.last_row_id).first();
  return c.json(serializeSocial(row), 201);
});

social.patch('/:id{[0-9]+}', validate('param', idParam), validate('json', socialUpdateSchema), async (c) => {
  const db = c.env.portfolio_db;
  const { id } = c.req.valid('param');
  const { columns, values } = pickColumns(c.req.valid('json'), SOCIAL_COLUMNS);

  const result = await db
    .prepare(`UPDATE social_links SET ${columns.map((column) => `${column} = ?`).join(', ')} WHERE id = ?`)
    .bind(...values, id)
    .run();
  if (result.meta.changes === 0) throw notFound('Social link not found');

  const row = await db.prepare(SQL.socialById).bind(id).first();
  return c.json(serializeSocial(row));
});

social.delete('/:id{[0-9]+}', validate('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const result = await c.env.portfolio_db.prepare('DELETE FROM social_links WHERE id = ?').bind(id).run();
  if (result.meta.changes === 0) throw notFound('Social link not found');
  return c.json({ ok: true });
});

export default social;
