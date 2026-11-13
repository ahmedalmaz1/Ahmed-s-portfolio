import { Hono } from 'hono';
import { z } from 'zod';
import { CONTENT_TYPES, mediaBase, sniffImage, sniffMp4 } from '../../lib/media.js';
import { LIMITS, MEDIA_FOLDERS } from '../../config.js';
import { ApiError } from '../../lib/errors.js';

const media = new Hono();

const folderSchema = z.enum(MEDIA_FOLDERS);

async function readImage(file, maxBytes, label) {
  if (!file || typeof file === 'string') throw new ApiError(400, `Missing "${label}" file`);
  if (file.size === 0) throw new ApiError(400, `"${label}" is empty`);
  if (file.size > maxBytes) throw new ApiError(413, `"${label}" is too large (max ${Math.round(maxBytes / 1048576)}MB)`);
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ext = sniffImage(head);
  if (!ext) throw new ApiError(415, `"${label}" must be a JPEG, PNG, WebP or AVIF image`);
  return { ext, body: await file.arrayBuffer() };
}

// multipart/form-data: file (required), thumb (optional), folder (projects | avatars | showreel)
media.post('/image', async (c) => {
  const length = Number(c.req.header('content-length'));
  if (!length) throw new ApiError(411, 'Content-Length is required');
  if (length > LIMITS.imageRequestMaxBytes) throw new ApiError(413, 'Upload is too large');

  const form = await c.req.formData().catch(() => {
    throw new ApiError(400, 'Expected multipart/form-data');
  });
  const folder = folderSchema.safeParse(form.get('folder'));
  if (!folder.success) throw new ApiError(400, `folder must be one of: ${MEDIA_FOLDERS.join(', ')}`);

  const main = await readImage(form.get('file'), LIMITS.imageMaxBytes, 'file');
  const thumb = form.get('thumb') ? await readImage(form.get('thumb'), LIMITS.thumbMaxBytes, 'thumb') : null;

  const uuid = crypto.randomUUID();
  const key = `${folder.data}/${uuid}.${main.ext}`;
  const thumbKey = thumb ? `${folder.data}/${uuid}_thumb.${thumb.ext}` : null;

  await c.env.MEDIA.put(key, main.body, { httpMetadata: { contentType: CONTENT_TYPES[main.ext] } });
  if (thumb) {
    try {
      await c.env.MEDIA.put(thumbKey, thumb.body, { httpMetadata: { contentType: CONTENT_TYPES[thumb.ext] } });
    } catch (err) {
      await c.env.MEDIA.delete(key);
      throw err;
    }
  }

  const base = mediaBase(c);
  return c.json({ key, url: `${base}/${key}`, thumbKey, thumbUrl: thumbKey ? `${base}/${thumbKey}` : null }, 201);
});

// Raw body (Content-Type: video/mp4). Streamed straight into R2, never buffered in memory.
media.put('/showreel', async (c) => {
  const type = (c.req.header('content-type') ?? '').split(';')[0].trim().toLowerCase();
  if (type !== 'video/mp4') throw new ApiError(415, 'Send the video as Content-Type: video/mp4');

  const length = Number(c.req.header('content-length'));
  if (!length) throw new ApiError(411, 'Content-Length is required');
  if (length > LIMITS.showreelMaxBytes) {
    throw new ApiError(413, `Showreel is too large (max ${Math.round(LIMITS.showreelMaxBytes / 1048576)}MB). Compress it first.`);
  }
  if (!c.req.raw.body) throw new ApiError(400, 'Empty body');

  const key = `showreel/${crypto.randomUUID()}.mp4`;
  await c.env.MEDIA.put(key, c.req.raw.body, { httpMetadata: { contentType: 'video/mp4' } });

  // Verify it really is an MP4 after the upload; remove it otherwise.
  const head = await c.env.MEDIA.get(key, { range: { offset: 0, length: 16 } });
  const bytes = head ? new Uint8Array(await head.arrayBuffer()) : new Uint8Array();
  if (!sniffMp4(bytes)) {
    await c.env.MEDIA.delete(key);
    throw new ApiError(415, 'The uploaded file is not a valid MP4 video');
  }

  return c.json({ key, url: `${mediaBase(c)}/${key}` }, 201);
});

export default media;
