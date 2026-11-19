import { Hono } from 'hono';
import { notFound } from '../lib/errors.js';
import { cvFilename } from '../lib/media.js';

const cv = new Hono();

// Streams the CURRENT CV from R2. The address never changes when a new CV is uploaded, so links
// (portfolio button, LinkedIn, email signature...) keep working. The browser re-checks the ETag on
// every visit, so a replaced CV shows up immediately and an unchanged one costs a 304.
async function serveCv(c, disposition) {
  const row = await c.env.portfolio_db.prepare('SELECT name, cv_key FROM profile WHERE id = 1').first();
  if (!row?.cv_key) throw notFound('No CV has been uploaded yet');

  const request = c.req.raw;
  const object = await c.env.MEDIA.get(row.cv_key, { onlyIf: request.headers });
  if (!object) throw notFound('No CV has been uploaded yet');

  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');
  // inline = opens in the browser's PDF viewer, attachment = saves the file; both with a nice file name
  headers.set('Content-Disposition', `${disposition}; filename="${cvFilename(row.name)}"`);
  headers.set('ETag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

  if (!object.body) return new Response(null, { status: 304, headers }); // browser copy is still current
  headers.set('Content-Length', String(object.size));
  return new Response(object.body, { headers });
}

cv.get('/cv', (c) => serveCv(c, 'inline'));
cv.get('/cv/download', (c) => serveCv(c, 'attachment'));

export default cv;
