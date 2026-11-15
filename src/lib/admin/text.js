/** "Neon Alley 2!" -> "neon-alley-2" (latin letters and digits only, max 60 chars). */
export function slugify(title) {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

const ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"]);

/** Same rules as the API: a YouTube link (watch, youtu.be, embed, shorts, live) or an 11-char id. */
export function extractYouTubeId(input) {
  const raw = String(input ?? "").trim();
  if (ID.test(raw)) return raw;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase();
  let id = null;
  if (host === "youtu.be") id = url.pathname.split("/")[1];
  else if (HOSTS.has(host)) {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const [, kind, value] = url.pathname.split("/");
      if (["embed", "shorts", "live", "v"].includes(kind)) id = value;
    }
  }
  return id && ID.test(id) ? id : null;
}
