import { Hono } from 'hono';
import { ApiError } from '../../lib/errors.js';
import { pickColumns } from '../../lib/db.js';
import { assertMediaExists, deleteMedia, mediaBase } from '../../lib/media.js';
import { SQL } from '../../lib/queries.js';
import { serializeProfile } from '../../lib/serializers.js';
import { validate } from '../../middleware/validate.js';
import { PROFILE_COLUMNS, profileUpdateSchema } from '../../schemas/profile.js';

const profile = new Hono();

profile.get('/', async (c) => {
  const row = await c.env.portfolio_db.prepare(SQL.profile).first();
  return c.json(serializeProfile(row, mediaBase(c)));
});

// Only the fields that are sent change. Replaced avatar/showreel files are deleted from R2.
profile.patch('/', validate('json', profileUpdateSchema), async (c) => {
  const db = c.env.portfolio_db;
  const body = c.req.valid('json');
  const old = await db.prepare(SQL.profile).first();

  const newKeys = [body.avatarKey, body.showreelKey, body.showreelPosterKey].filter(Boolean);
  await assertMediaExists(c.env, newKeys);

  const { columns, values } = pickColumns(body, PROFILE_COLUMNS);
  if (!columns.length) throw new ApiError(400, 'Nothing to update');
  await db
    .prepare(`UPDATE profile SET ${columns.map((column) => `${column} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = 1`)
    .bind(...values)
    .run();

  const updated = await db.prepare(SQL.profile).first();
  const stale = ['avatar_key', 'showreel_key', 'showreel_poster_key']
    .filter((column) => old[column] && old[column] !== updated[column])
    .map((column) => old[column]);
  await deleteMedia(c.env, stale);

  return c.json(serializeProfile(updated, mediaBase(c)));
});

export default profile;
