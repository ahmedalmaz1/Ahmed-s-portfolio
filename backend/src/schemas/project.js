import { z } from 'zod';
import { LIMITS } from '../config.js';
import { extractYouTubeId } from '../lib/youtube.js';
import { atLeastOneField, emptyToNull, keyOf, slug, text } from './common.js';

const toolkit = z
  .array(text(LIMITS.toolkitItemMax, 1))
  .max(LIMITS.toolkitMaxItems)
  .transform((items) => JSON.stringify([...new Set(items)]));

// Accepts a YouTube link or id, stores only the 11-char id.
const youtube = emptyToNull(
  z
    .string()
    .trim()
    .max(300)
    .refine((value) => extractYouTubeId(value) !== null, 'Must be a valid YouTube link or video id')
    .transform((value) => extractYouTubeId(value)),
);

const fields = {
  slug,
  title: text(LIMITS.titleMax, 1),
  description: text(LIMITS.descriptionMax),
  toolkit,
  youtube,
  posterKey: emptyToNull(keyOf('projects')),
  posterThumbKey: emptyToNull(keyOf('projects', { thumb: true })),
  published: z.boolean().transform((value) => (value ? 1 : 0)),
  sortOrder: z.number().int().min(0).max(100000),
};

const optional = Object.fromEntries(Object.entries(fields).map(([name, schema]) => [name, schema.optional()]));

export const projectCreateSchema = z.object({ ...optional, slug: fields.slug, title: fields.title });

export const projectUpdateSchema = z.object(optional).refine(...atLeastOneField);

export const PROJECT_COLUMNS = {
  slug: 'slug',
  title: 'title',
  description: 'description',
  toolkit: 'toolkit',
  youtube: 'youtube_id',
  posterKey: 'poster_key',
  posterThumbKey: 'poster_thumb_key',
  published: 'published',
  sortOrder: 'sort_order',
};

const dimension = z.number().int().min(1).max(30000).nullable();

export const imageCreateSchema = z.object({
  imageKey: keyOf('projects'),
  thumbKey: emptyToNull(keyOf('projects', { thumb: true })).optional(),
  width: dimension.optional(),
  height: dimension.optional(),
  alt: text(LIMITS.altMax).optional(),
});

export const imageUpdateSchema = z.object({ alt: text(LIMITS.altMax) });
