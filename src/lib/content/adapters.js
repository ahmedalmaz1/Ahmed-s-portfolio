// Pure functions that turn API responses into the shapes the UI components use.
// No imports from the app, so they can be unit-tested with `node --test`.

export const FALLBACK_EMAIL = "hello@ahmedalmaz.com";
const SOCIAL_KEYS = ["ArtStation", "LinkedIn", "Instagram", "Facebook"];

/** One project from the API -> the UI project shape. */
export function toProject(api, channelName = "", channelAvatar = "") {
  return {
    slug: api.slug,
    href: `/projects/${api.slug}`,
    title: api.title,
    description: api.description ?? "",
    image: api.poster?.url ?? null,
    images: (api.images ?? []).map((image) => ({
      src: image.url,
      width: image.width ?? undefined,
      height: image.height ?? undefined,
      alt: image.alt || undefined,
    })),
    tools: api.toolkit ?? [],
    video: api.youtubeId
      ? {
          id: api.youtubeId,
          title: `${api.title} video`,
          channel: { name: channelName, avatar: channelAvatar },
        }
      : null,
  };
}

/** Bio text -> paragraphs (blank line = new paragraph). */
export function toParagraphs(text) {
  return String(text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

/** The /site response -> everything the home page needs. */
export function toSite(api, channelName = "", apiUrl = "") {
  const { profile, socialLinks = [], projects = [] } = api;
  const links = Object.fromEntries(
    SOCIAL_KEYS.map((name) => [
      name.toLowerCase(),
      socialLinks.find((l) => l.platform === name)?.url ?? null,
    ]),
  );
  return {
    name: profile.name || channelName,
    bio: toParagraphs(profile.bio),
    email: profile.email || FALLBACK_EMAIL,
    avatar: profile.avatar?.url ?? null,
    showreel: profile.showreel?.url ?? null,
    // stable addresses served by the API: /cv opens the PDF, /cv/download saves it
    cv: profile.cv
      ? { view: `${apiUrl}/cv`, download: `${apiUrl}/cv/download` }
      : null,
    links,
    projects: projects.map((p) =>
      toProject(p, channelName, profile.avatar?.url ?? ""),
    ),
  };
}

/** The project after `slug` in the published list (wraps around). */
export function nextProject(projects, slug) {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1 || !projects.length) return null;
  return projects[(index + 1) % projects.length];
}
