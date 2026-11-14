// End-to-end smoke test against a running API (local `wrangler dev` or a deployed Worker).
//   node scripts/smoke.mjs http://localhost:8787 <ADMIN_PASSWORD>
//   node scripts/smoke.mjs https://api.example.com <ADMIN_PASSWORD> --skip-lockout     (deployed API)
// Creates and removes its own projects, links and files. The only leftovers are the profile
// text fields (name/bio/email), see the note printed at the end.
// --skip-lockout: skips the brute-force test, which would lock YOUR real IP for 15 minutes on a deployed API.

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--'));
const [baseArg, password] = args.filter((a) => !a.startsWith('--'));
const skipLockout = flags.includes('--skip-lockout');
if (!baseArg || !password) {
	console.error('Usage: node scripts/smoke.mjs <api-url> <admin-password> [--skip-lockout]');
	process.exit(2);
}
const base = baseArg.replace(/\/$/, '');

// 1x1 PNG and a minimal MP4 header: enough to pass the content sniffing.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const MP4 = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypisom'), Buffer.from([0, 0, 2, 0]), Buffer.from('isommp41')]);

let passed = 0;
const failures = [];
const check = (name, condition, extra = '') => {
	if (condition) passed++;
	else {
		failures.push(name);
		console.log(`  FAIL  ${name} ${extra}`);
	}
};

let token = '';
async function api(method, path, { json, body, headers = {}, auth = true } = {}) {
	const h = { ...headers };
	if (auth && token) h.Authorization = `Bearer ${token}`;
	let payload = body;
	if (json !== undefined) {
		h['Content-Type'] = 'application/json';
		payload = JSON.stringify(json);
	}
	const res = await fetch(base + path, { method, headers: h, body: payload });
	const text = await res.text();
	let data = null;
	try {
		data = JSON.parse(text);
	} catch {
		data = text;
	}
	return { status: res.status, data, headers: res.headers };
}

function imageForm(folder, { thumb = true, bytes = PNG, name = 'a.png' } = {}) {
	const form = new FormData();
	form.set('folder', folder);
	form.set('file', new Blob([bytes], { type: 'image/png' }), name);
	if (thumb) form.set('thumb', new Blob([bytes], { type: 'image/png' }), 't.png');
	return form;
}

console.log(`Smoke test against ${base}\n`);

// --- health + auth -------------------------------------------------------
let r = await api('GET', '/', { auth: false });
check('GET / is ok', r.status === 200 && r.data.ok === true);

r = await api('GET', '/admin/projects', { auth: false });
check('admin route without token -> 401', r.status === 401, `(got ${r.status})`);
r = await api('GET', '/admin/projects', { auth: false, headers: { Authorization: 'Bearer garbage' } });
check('admin route with bad token -> 401', r.status === 401, `(got ${r.status})`);

r = await api('POST', '/login', { json: { password: 'definitely-wrong' }, auth: false });
check('wrong password -> 401', r.status === 401, `(got ${r.status})`);
r = await api('POST', '/login', { json: {}, auth: false });
check('login without password -> 400', r.status === 400, `(got ${r.status})`);

r = await api('POST', '/login', { json: { password }, auth: false });
check('correct password -> token', r.status === 200 && typeof r.data.token === 'string');
token = r.data.token;

// --- profile -------------------------------------------------------------
r = await api('PATCH', '/admin/profile', { json: { email: 'not-an-email' } });
check('profile: invalid email -> 400', r.status === 400 && r.data.details?.[0]?.field === 'email', JSON.stringify(r.data));
r = await api('PATCH', '/admin/profile', { json: {} });
check('profile: empty patch -> 400', r.status === 400);
r = await api('PATCH', '/admin/profile', { json: { avatarKey: 'avatars/00000000-0000-0000-0000-000000000000.png' } });
check('profile: key that was never uploaded -> 400', r.status === 400, JSON.stringify(r.data));
r = await api('PATCH', '/admin/profile', { json: { name: 'Smoke Artist', bio: 'Hello', email: 'Smoke@Example.com' } });
check(
	'profile: update ok + email lowercased',
	r.status === 200 && r.data.name === 'Smoke Artist' && r.data.email === 'smoke@example.com',
	JSON.stringify(r.data),
);
r = await api('PATCH', '/admin/profile', { json: { bio: 'Only the bio changed' } });
check('profile: partial update keeps name', r.status === 200 && r.data.name === 'Smoke Artist' && r.data.bio === 'Only the bio changed');

// --- social links ----------------------------------------------------------
for (const bad of ['javascript:alert(1)', 'http://insecure.example.com', 'https://user:pass@evil.example.com', 'not a url']) {
	r = await api('POST', '/admin/social-links', { json: { platform: 'Behance', url: bad } });
	check(`social: rejects ${bad}`, r.status === 400, `(got ${r.status})`);
}
r = await api('POST', '/admin/social-links', { json: { platform: 'MySpace', url: 'https://example.com' } });
check('social: unknown platform -> 400', r.status === 400);
r = await api('POST', '/admin/social-links', { json: { platform: 'Behance', url: 'https://behance.net/smoke' } });
const s1 = r.data;
check('social: create 1', r.status === 201 && s1.sortOrder === 0, JSON.stringify(r.data));
r = await api('POST', '/admin/social-links', { json: { platform: 'ArtStation', url: 'https://smoke.artstation.com' } });
const s2 = r.data;
check('social: create 2 gets next sortOrder', r.status === 201 && s2.sortOrder === 1);
r = await api('PUT', '/admin/social-links/reorder', { json: { ids: [s2.id, s1.id] } });
check('social: reorder', r.status === 200 && r.data[0].id === s2.id);
r = await api('PUT', '/admin/social-links/reorder', { json: { ids: [s2.id, 99999] } });
check('social: reorder with unknown id -> 400', r.status === 400);
r = await api('PATCH', '/admin/social-links/99999', { json: { url: 'https://example.com' } });
check('social: patch unknown id -> 404', r.status === 404);
r = await api('DELETE', `/admin/social-links/${s1.id}`);
check('social: delete', r.status === 200);
r = await api('DELETE', `/admin/social-links/${s1.id}`);
check('social: delete twice -> 404', r.status === 404);

// --- media uploads ---------------------------------------------------------
r = await api('POST', '/admin/media/image', {
	body: imageForm('projects', { bytes: Buffer.from('<svg onload=alert(1)/>'), name: 'x.png' }),
});
check('upload: fake image (svg/text) -> 415', r.status === 415, JSON.stringify(r.data));
r = await api('POST', '/admin/media/image', { body: imageForm('hacks') });
check('upload: unknown folder -> 400', r.status === 400);
r = await api('POST', '/admin/media/image', { body: imageForm('projects'), auth: false });
check('upload: without token -> 401', r.status === 401);

r = await api('POST', '/admin/media/image', { body: imageForm('projects') });
const poster = r.data;
check(
	'upload: poster + thumb -> 201',
	r.status === 201 && poster.key.endsWith('.png') && poster.thumbKey.includes('_thumb'),
	JSON.stringify(r.data),
);
r = await api('POST', '/admin/media/image', { body: imageForm('projects') });
const img1 = r.data;
r = await api('POST', '/admin/media/image', { body: imageForm('projects') });
const img2 = r.data;

let m = await fetch(poster.url);
check('media: served with correct type', m.status === 200 && m.headers.get('content-type') === 'image/png');
check('media: immutable cache header', (m.headers.get('cache-control') ?? '').includes('immutable'));
check('media: accepts ranges', m.headers.get('accept-ranges') === 'bytes');
const etag = m.headers.get('etag');
m = await fetch(poster.url, { headers: { 'If-None-Match': etag } });
check('media: conditional request -> 304', m.status === 304, `(got ${m.status})`);
m = await fetch(poster.url, { headers: { Range: 'bytes=0-3' } });
const partial = Buffer.from(await m.arrayBuffer());
check(
	'media: range request -> 206 with 4 bytes',
	m.status === 206 && partial.length === 4 && /^bytes 0-3\//.test(m.headers.get('content-range') ?? ''),
	`(got ${m.status})`,
);
m = await fetch(`${base}/media/projects/../../etc/passwd`);
check('media: junk key -> 404', m.status === 404);
m = await fetch(`${base}/media/projects/00000000-0000-0000-0000-000000000000.png`);
check('media: missing file -> 404', m.status === 404);

// --- projects ----------------------------------------------------------------
const good = {
	slug: 'smoke-project',
	title: 'Smoke Project',
	description: 'A test',
	toolkit: ['Blender', 'ZBrush', 'Blender'],
	youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
	posterKey: poster.key,
	posterThumbKey: poster.thumbKey,
};
for (const [name, patch] of Object.entries({
	'bad slug': { slug: 'Bad Slug!' },
	'empty title': { title: '   ' },
	'too many tools': { toolkit: Array.from({ length: 21 }, (_, i) => `tool${i}`) },
	'invalid youtube': { youtube: 'https://vimeo.com/123' },
	'javascript youtube': { youtube: 'javascript:alert(1)' },
	'poster from another folder': { posterKey: 'avatars/00000000-0000-0000-0000-000000000000.png' },
})) {
	r = await api('POST', '/admin/projects', { json: { ...good, ...patch } });
	check(`project: rejects ${name}`, r.status === 400, `(got ${r.status} ${JSON.stringify(r.data)})`);
}

r = await api('POST', '/admin/projects', { json: good });
const project = r.data;
check('project: create', r.status === 201 && project.slug === 'smoke-project', JSON.stringify(r.data));
check('project: toolkit de-duplicated', JSON.stringify(project.toolkit) === '["Blender","ZBrush"]');
check('project: youtube link stored as id', project.youtubeId === 'dQw4w9WgXcQ');
check('project: poster urls', project.poster?.url === poster.url && project.poster?.thumbUrl === poster.thumbUrl);
r = await api('POST', '/admin/projects', { json: good });
check('project: duplicate slug -> 409', r.status === 409, `(got ${r.status})`);

r = await api('POST', `/admin/projects/${project.id}/images`, {
	json: { imageKey: img1.key, thumbKey: img1.thumbKey, width: 3840, height: 2160, alt: 'First' },
});
const i1 = r.data;
check('image: add 1', r.status === 201 && i1.sortOrder === 0 && i1.width === 3840, JSON.stringify(r.data));
r = await api('POST', `/admin/projects/${project.id}/images`, { json: { imageKey: img2.key, thumbKey: img2.thumbKey } });
const i2 = r.data;
check('image: add 2 gets next sortOrder', r.status === 201 && i2.sortOrder === 1);
r = await api('POST', `/admin/projects/${project.id}/images`, { json: { imageKey: 'projects/00000000-0000-0000-0000-000000000000.png' } });
check('image: unknown key -> 400', r.status === 400);
r = await api('POST', '/admin/projects/99999/images', { json: { imageKey: img1.key } });
check('image: unknown project -> 404', r.status === 404);
r = await api('PUT', `/admin/projects/${project.id}/images/reorder`, { json: { ids: [i2.id, i1.id] } });
check('image: reorder', r.status === 200 && r.data[0].id === i2.id);
r = await api('PATCH', `/admin/projects/images/${i1.id}`, { json: { alt: 'Renamed' } });
check('image: update alt', r.status === 200 && r.data.alt === 'Renamed');

// second project to test next/prev + ordering + unpublished
r = await api('POST', '/admin/projects', { json: { slug: 'second-project', title: 'Second' } });
const p2 = r.data;
check('project: minimal create gets defaults', r.status === 201 && p2.published === true && p2.sortOrder === 1 && p2.poster === null);

r = await api('GET', '/projects/smoke-project', { auth: false });
check(
	'public: detail has images in order',
	r.status === 200 && r.data.images.length === 2 && r.data.images[0].id === i2.id,
	JSON.stringify(r.data).slice(0, 200),
);
check('public: detail has next project', r.data.next?.slug === 'second-project');
check('public: cache header', (r.headers.get('cache-control') ?? '').includes('max-age'));
r = await api('GET', '/projects/second-project', { auth: false });
check('public: next wraps around to the first', r.data.next?.slug === 'smoke-project');
r = await api('GET', '/projects/does-not-exist', { auth: false });
check('public: unknown slug -> 404', r.status === 404);

r = await api('PATCH', `/admin/projects/${p2.id}`, { json: { published: false } });
check('project: unpublish', r.status === 200 && r.data.published === false);
r = await api('GET', '/projects/second-project', { auth: false });
check('public: unpublished project is hidden', r.status === 404);
r = await api('GET', '/projects', { auth: false });
check('public: list hides unpublished', r.status === 200 && r.data.every((p) => p.slug !== 'second-project'));
r = await api('GET', '/admin/projects');
check(
	'admin: list shows unpublished',
	r.data.some((p) => p.slug === 'second-project'),
);

r = await api('PUT', '/admin/projects/reorder', { json: { ids: [p2.id, project.id] } });
check('project: reorder', r.status === 200 && r.data[0].id === p2.id);

r = await api('GET', '/site', { auth: false });
check(
	'public: /site bundles profile + links + projects',
	r.status === 200 && r.data.profile.name === 'Smoke Artist' && Array.isArray(r.data.socialLinks) && r.data.projects.length === 1,
	JSON.stringify(r.data).slice(0, 200),
);

// replacing the poster deletes the old files from R2
r = await api('POST', '/admin/media/image', { body: imageForm('projects') });
const newPoster = r.data;
r = await api('PATCH', `/admin/projects/${project.id}`, { json: { posterKey: newPoster.key, posterThumbKey: newPoster.thumbKey } });
check('project: replace poster', r.status === 200 && r.data.poster.key === newPoster.key);
check('project: old poster removed from R2', (await fetch(poster.url)).status === 404);

// deleting an image removes its files
r = await api('DELETE', `/admin/projects/images/${i1.id}`);
check('image: delete', r.status === 200);
check('image: files removed from R2', (await fetch(img1.url)).status === 404);

// --- showreel + avatar -------------------------------------------------------
r = await api('PUT', '/admin/media/showreel', { body: MP4, headers: { 'Content-Type': 'video/webm' } });
check('showreel: wrong content type -> 415', r.status === 415);
r = await api('PUT', '/admin/media/showreel', { body: PNG, headers: { 'Content-Type': 'video/mp4' } });
check('showreel: non-mp4 bytes are rejected', r.status === 415, JSON.stringify(r.data));
r = await api('PUT', '/admin/media/showreel', { body: MP4, headers: { 'Content-Type': 'video/mp4' } });
const reel = r.data;
check('showreel: upload mp4 -> 201', r.status === 201 && reel.key.endsWith('.mp4'), JSON.stringify(r.data));
m = await fetch(reel.url, { headers: { Range: 'bytes=4-7' } });
check(
	'showreel: range request -> 206 "ftyp"',
	m.status === 206 && Buffer.from(await m.arrayBuffer()).toString() === 'ftyp',
	`(got ${m.status})`,
);

r = await api('POST', '/admin/media/image', { body: imageForm('showreel', { thumb: false }) });
const reelPoster = r.data;
r = await api('POST', '/admin/media/image', { body: imageForm('avatars', { thumb: false }) });
const avatar = r.data;
r = await api('PATCH', '/admin/profile', { json: { showreelKey: reel.key, showreelPosterKey: reelPoster.key, avatarKey: avatar.key } });
check(
	'profile: attach avatar + showreel',
	r.status === 200 && r.data.showreel?.url === reel.url && r.data.avatar?.url === avatar.url,
	JSON.stringify(r.data),
);
r = await api('PATCH', '/admin/profile', { json: { avatarKey: poster.key } });
check('profile: avatar key from wrong folder -> 400', r.status === 400);

r = await api('PUT', '/admin/media/showreel', { body: MP4, headers: { 'Content-Type': 'video/mp4' } });
const reel2 = r.data;
r = await api('PATCH', '/admin/profile', { json: { showreelKey: reel2.key } });
check('profile: replace showreel', r.status === 200 && r.data.showreel.key === reel2.key);
check('profile: old showreel removed from R2', (await fetch(reel.url)).status === 404);

// --- cleanup + lockout -------------------------------------------------------
r = await api('DELETE', `/admin/projects/${project.id}`);
check('project: delete', r.status === 200);
check('project: poster files removed after delete', (await fetch(newPoster.url)).status === 404 && (await fetch(img2.url)).status === 404);
r = await api('DELETE', `/admin/projects/${project.id}`);
check('project: delete twice -> 404', r.status === 404);
r = await api('DELETE', `/admin/projects/${p2.id}`);
r = await api('DELETE', `/admin/social-links/${s2.id}`);
r = await api('PATCH', '/admin/profile', { json: { name: '' } });
check('profile: empty name -> 400', r.status === 400);
r = await api('PATCH', '/admin/profile', { json: { avatarKey: null, showreelKey: null, showreelPosterKey: null } });
check('profile: detach avatar + showreel', r.status === 200 && r.data.avatar === null && r.data.showreel === null, JSON.stringify(r.data));
check('profile: detached showreel removed from R2', (await fetch(reel2.url)).status === 404);
check('profile: detached avatar removed from R2', (await fetch(avatar.url)).status === 404);
r = await api('PATCH', '/admin/profile', { json: { email: '' } });
check('profile: empty email clears the field', r.status === 200 && r.data.email === null, JSON.stringify(r.data));

if (!skipLockout) {
	const ip = { 'CF-Connecting-IP': '198.51.100.99' };
	for (let i = 0; i < 5; i++) await api('POST', '/login', { json: { password: 'nope' }, auth: false, headers: ip });
	r = await api('POST', '/login', { json: { password }, auth: false, headers: ip });
	check(
		'login: locked after 5 failures (even with the right password)',
		r.status === 429 && Number(r.headers.get('retry-after')) > 0,
		`(got ${r.status})`,
	);
}

console.log(`\n${passed} checks passed, ${failures.length} failed`);
console.log('\nNote: the profile still holds the test values (name "Smoke Artist", bio, email).');
console.log('On a database that already has real data, do NOT run this test. On an empty one, reset the profile with:');
console.log("  npx wrangler d1 execute portfolio-db --remote --command \"UPDATE profile SET name='', bio='', email=NULL WHERE id=1\"");
if (failures.length) {
	console.log('Failed:\n - ' + failures.join('\n - '));
	process.exit(1);
}
