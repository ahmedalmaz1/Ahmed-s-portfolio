import { z } from 'zod';
import { isMediaKey } from '../lib/media.js';

export const id = z.coerce.number().int().positive();

/** Trimmed string with length limits. */
export const text = (max, min = 0) => z.string().trim().min(min).max(max);

/** Empty string -> null, so HTML forms can send "" to clear a field. */
export const emptyToNull = (schema) =>
  z.preprocess((value) => (typeof value === 'string' && value.trim() === '' ? null : value), schema.nullable());

export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single dashes (e.g. my-project)');

export const email = z.string().trim().toLowerCase().max(254).email('Invalid email address');

/** https links only, no embedded credentials (blocks javascript:, data:, http:). */
export const httpsUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    try {
      const u = new URL(value);
      return u.protocol === 'https:' && !u.username && !u.password;
    } catch {
      return false;
    }
  }, 'Must be a valid https:// link');

/** A media key that belongs to `folder`. thumb/video select which kind of key is accepted. */
export const keyOf = (folder, { thumb = false, video = false } = {}) =>
  z
    .string()
    .refine(
      (key) =>
        isMediaKey(key) &&
        key.startsWith(`${folder}/`) &&
        key.includes('_thumb') === thumb &&
        key.endsWith('.mp4') === video,
      'Invalid media key',
    );

export const atLeastOneField = [(obj) => Object.keys(obj).length > 0, 'Send at least one field to update'];

export const reorderSchema = z.object({
  ids: z
    .array(id)
    .min(1)
    .max(200)
    .refine((ids) => new Set(ids).size === ids.length, 'Duplicate ids'),
});

export const idParam = z.object({ id });
