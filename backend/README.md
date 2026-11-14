# Portfolio API (Cloudflare Worker + D1 + R2)

Hono API. Data in D1, images and the showreel in R2. Runs on the Cloudflare free plan.

## Structure
```
src/
  index.js          app setup: CORS, error handler, route mounting (/admin behind one auth guard)
  config.js         limits, allowed social platforms, cache settings
  lib/              errors, media (sniffing, urls, cleanup), db helpers, queries, serializers, youtube
  middleware/       auth (JWT), validate (zod), cache
  schemas/          zod validation rules
  routes/           public, media, auth, admin/{profile,social,projects,media}
migrations/         D1 schema
scripts/smoke.mjs   end-to-end test (80 checks)
```

## Public endpoints
| Method | Path | Notes |
|---|---|---|
| GET | `/site` | profile + social links + published projects in one request |
| GET | `/profile`, `/social-links`, `/projects` | |
| GET | `/projects/:slug` | project + gallery images + `next` project |
| GET | `/media/*` | streams from R2 (Range + ETag, immutable cache) |
| POST | `/login` | `{ password }` -> `{ token }` (locks the IP for 15 min after 5 failures) |

## Admin endpoints (`Authorization: Bearer <token>`)
| Method | Path | Notes |
|---|---|---|
| GET / PATCH | `/admin/profile` | PATCH changes only the fields sent; `null` or `""` clears a field |
| GET / POST | `/admin/social-links` | max 12, https links only |
| PATCH / DELETE | `/admin/social-links/:id` | |
| PUT | `/admin/social-links/reorder` | `{ ids: [...] }` |
| GET / POST | `/admin/projects` | list includes unpublished |
| GET / PATCH / DELETE | `/admin/projects/:id` | delete removes its files from R2 |
| PUT | `/admin/projects/reorder` | `{ ids: [...] }` |
| POST | `/admin/projects/:id/images` | `{ imageKey, thumbKey?, width?, height?, alt? }` (max 40) |
| PUT | `/admin/projects/:id/images/reorder` | |
| PATCH / DELETE | `/admin/projects/images/:id` | |
| POST | `/admin/media/image` | multipart: `file`, `thumb?`, `folder` (projects/avatars/showreel) |
| PUT | `/admin/media/showreel` | raw body, `Content-Type: video/mp4`, max 90 MB (streamed) |

Upload first (you get keys back), then attach the keys when saving the project/profile.
Errors always look like `{ "error": "...", "details": [{ "field": "...", "message": "..." }] }`.

## Secrets and variables
```
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put JWT_SECRET
```
Local development: put both in `.dev.vars` (never commit it).
`ALLOWED_ORIGINS` (wrangler.jsonc `vars`) lists the browser origins allowed to call the API.
`MEDIA_BASE_URL` (optional) serves media from a custom R2 domain, which avoids spending Worker requests on images.

## Test
```
npx wrangler dev                                   # terminal 1 (do not press the "t" tunnel key)
node scripts/smoke.mjs http://localhost:8787 <ADMIN_PASSWORD>   # terminal 2
```
