// Every tunable number/list lives here so behaviour can be changed in one place.

export const SOCIAL_PLATFORMS = [
  'ArtStation',
  'Sketchfab',
  'Behance',
  'Dribbble',
  'Vimeo',
  'YouTube',
  'Instagram',
  'LinkedIn',
  'X',
  'TikTok',
  'Facebook',
  'GitHub',
  'Website',
];

// R2 folders. Keys look like  projects/<uuid>.webp  or  projects/<uuid>_thumb.webp
export const MEDIA_FOLDERS = ['projects', 'avatars', 'showreel'];

const MB = 1024 * 1024;

export const LIMITS = {
  nameMax: 100,
  titleMax: 120,
  descriptionMax: 3000,
  bioMax: 3000,
  altMax: 200,
  toolkitMaxItems: 20,
  toolkitItemMax: 40,
  imagesPerProject: 40,
  socialLinksMax: 12,
  imageMaxBytes: 15 * MB,
  thumbMaxBytes: 2 * MB,
  imageRequestMaxBytes: 18 * MB, // image + thumb + multipart overhead
  showreelMaxBytes: 90 * MB, // free plan caps request bodies at 100 MB
};

export const LOGIN = {
  maxFailures: 5,
  lockSeconds: 15 * 60,
  tokenTtlSeconds: 12 * 60 * 60,
};

// Public JSON is safe to cache briefly in browsers/CDNs.
export const PUBLIC_CACHE = 'public, max-age=60, stale-while-revalidate=300';
// Media keys are random UUIDs, so a file never changes once uploaded.
export const MEDIA_CACHE = 'public, max-age=31536000, immutable';
