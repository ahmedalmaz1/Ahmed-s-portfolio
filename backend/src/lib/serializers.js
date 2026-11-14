// DB rows -> API objects. Media is always exposed as ready-to-use URLs.

const url = (base, key) => (key ? `${base}/${key}` : null);

function parseToolkit(json) {
  try {
    const value = JSON.parse(json ?? '[]');
    return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function serializeProfile(row, base) {
  return {
    name: row.name,
    bio: row.bio,
    email: row.email,
    avatar: row.avatar_key ? { key: row.avatar_key, url: url(base, row.avatar_key) } : null,
    showreel: row.showreel_key
      ? {
          key: row.showreel_key,
          url: url(base, row.showreel_key),
          poster: row.showreel_poster_key
            ? { key: row.showreel_poster_key, url: url(base, row.showreel_poster_key) }
            : null,
        }
      : null,
    updatedAt: row.updated_at,
  };
}

export const serializeSocial = (row) => ({
  id: row.id,
  platform: row.platform,
  url: row.url,
  sortOrder: row.sort_order,
});

export function serializeProject(row, base) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    toolkit: parseToolkit(row.toolkit),
    poster: row.poster_key
      ? {
          key: row.poster_key,
          url: url(base, row.poster_key),
          thumbKey: row.poster_thumb_key,
          thumbUrl: url(base, row.poster_thumb_key ?? row.poster_key),
        }
      : null,
    youtubeId: row.youtube_id,
    sortOrder: row.sort_order,
    published: row.published === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const serializeImage = (row, base) => ({
  id: row.id,
  key: row.image_key,
  url: url(base, row.image_key),
  thumbKey: row.thumb_key,
  thumbUrl: url(base, row.thumb_key ?? row.image_key),
  width: row.width,
  height: row.height,
  alt: row.alt,
  sortOrder: row.sort_order,
});
