import { Hono } from 'hono';
import { z } from 'zod';
import { notFound } from '../lib/errors.js';
import { mediaBase } from '../lib/media.js';
import { SQL } from '../lib/queries.js';
import { serializeImage, serializeProfile, serializeProject, serializeSocial } from '../lib/serializers.js';
import { publicCache } from '../middleware/cache.js';
import { validate } from '../middleware/validate.js';
import { slug } from '../schemas/common.js';

const pub = new Hono();

pub.get('/', (c) => c.json({ ok: true, service: 'portfolio-api' }));

// Everything the landing page needs, in one round trip (a single D1 batch).
pub.get('/site', publicCache, async (c) => {
  const db = c.env.portfolio_db;
  const [profile, social, projects] = await db.batch([
    db.prepare(SQL.profile),
    db.prepare(SQL.social),
    db.prepare(SQL.publishedProjects),
  ]);
  const base = mediaBase(c);
  return c.json({
    profile: serializeProfile(profile.results[0], base),
    socialLinks: social.results.map(serializeSocial),
    projects: projects.results.map((row) => serializeProject(row, base)),
  });
});

pub.get('/profile', publicCache, async (c) => {
  const row = await c.env.portfolio_db.prepare(SQL.profile).first();
  return c.json(serializeProfile(row, mediaBase(c)));
});

pub.get('/social-links', publicCache, async (c) => {
  const { results } = await c.env.portfolio_db.prepare(SQL.social).all();
  return c.json(results.map(serializeSocial));
});

pub.get('/projects', publicCache, async (c) => {
  const { results } = await c.env.portfolio_db.prepare(SQL.publishedProjects).all();
  const base = mediaBase(c);
  return c.json(results.map((row) => serializeProject(row, base)));
});

pub.get('/projects/:slug', publicCache, validate('param', z.object({ slug })), async (c) => {
  const db = c.env.portfolio_db;
  const { slug: wanted } = c.req.valid('param');
  const [project, images, all] = await db.batch([
    db.prepare(SQL.projectBySlug).bind(wanted),
    db.prepare(SQL.imagesBySlug).bind(wanted),
    db.prepare(SQL.publishedProjects),
  ]);
  const row = project.results[0];
  if (!row) throw notFound('Project not found');

  const base = mediaBase(c);
  const list = all.results;
  const index = list.findIndex((p) => p.id === row.id);
  const nextRow = list.length > 1 ? list[(index + 1) % list.length] : null;

  return c.json({
    ...serializeProject(row, base),
    images: images.results.map((image) => serializeImage(image, base)),
    next: nextRow ? { slug: nextRow.slug, title: nextRow.title } : null,
  });
});

export default pub;
