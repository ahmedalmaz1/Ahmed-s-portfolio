import { Hono } from 'hono';
import { MEDIA_CACHE } from '../config.js';
import { notFound } from '../lib/errors.js';
import { isMediaKey } from '../lib/media.js';

const media = new Hono();

function contentRange(range, size) {
  let offset;
  let length;
  if (range.suffix !== undefined) {
    length = Math.min(range.suffix, size);
    offset = size - length;
  } else {
    offset = range.offset ?? 0;
    length = range.length ?? size - offset;
  }
  return `bytes ${offset}-${offset + length - 1}/${size}`;
}

// Streams files from R2 with Range (video seeking, required by Safari) and ETag support.
media.get('/media/*', async (c) => {
  let key;
  try {
    key = decodeURIComponent(c.req.path.slice('/media/'.length));
  } catch {
    throw notFound();
  }
  if (!isMediaKey(key)) throw notFound(); // junk keys never reach R2

  const request = c.req.raw;
  const object = await c.env.MEDIA.get(key, { range: request.headers, onlyIf: request.headers });
  if (!object) throw notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('ETag', object.httpEtag);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', MEDIA_CACHE);
  headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

  if (!object.body) return new Response(null, { status: 304, headers });

  let status = 200;
  if (object.range && request.headers.has('range')) {
    status = 206;
    headers.set('Content-Range', contentRange(object.range, object.size));
  }
  return new Response(object.body, { status, headers });
});

export default media;
