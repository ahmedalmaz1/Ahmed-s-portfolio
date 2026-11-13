import { ApiError } from './errors.js';

// projects/<uuid>.webp, projects/<uuid>_thumb.webp, showreel/<uuid>.mp4 ...
const KEY_RE = /^(projects|avatars|showreel)\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(_thumb)?\.(webp|jpg|png|avif|mp4)$/;

export const isMediaKey = (key) => typeof key === 'string' && KEY_RE.test(key);

export const CONTENT_TYPES = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  mp4: 'video/mp4',
};

const ascii = (bytes, from, to) => String.fromCharCode(...bytes.slice(from, to));

/** Detects the real image type from the first bytes (never trust file names or client headers). */
export function sniffImage(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes.length >= 8 && ascii(bytes, 1, 4) === 'PNG' && bytes[0] === 0x89) return 'png';
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') return 'webp';
  if (bytes.length >= 12 && ascii(bytes, 4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(bytes, 8, 12))) return 'avif';
  return null;
}

export function sniffMp4(bytes) {
  return bytes.length >= 12 && ascii(bytes, 4, 8) === 'ftyp';
}

/** Base URL used to build public media links. Set MEDIA_BASE_URL to serve media from a custom R2 domain. */
export function mediaBase(c) {
  const configured = c.env.MEDIA_BASE_URL;
  const base = configured || `${new URL(c.req.url).origin}/media`;
  return base.replace(/\/+$/, '');
}

/** Rejects the request when a referenced key was never uploaded. */
export async function assertMediaExists(env, keys) {
  const unique = [...new Set(keys.filter(Boolean))];
  const checks = await Promise.all(unique.map((key) => env.MEDIA.head(key)));
  const missing = unique.filter((_, i) => !checks[i]);
  if (missing.length) {
    throw new ApiError(400, 'Referenced media does not exist', missing.map((key) => ({ field: 'key', message: `${key} was not uploaded` })));
  }
}

/** Best-effort cleanup: a failed delete must never fail the request that triggered it. */
export async function deleteMedia(env, keys) {
  const unique = [...new Set(keys.filter(Boolean))];
  if (!unique.length) return;
  try {
    await env.MEDIA.delete(unique);
  } catch (err) {
    console.warn('R2 cleanup failed:', unique, err?.message);
  }
}
