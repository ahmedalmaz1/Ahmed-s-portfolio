const DAY = 60 * 60 * 24;

// Large static media keeps its file name when replaced, so it is cached for a
// week (with background revalidation) instead of "immutable".
const mediaCache = [
  {
    key: "Cache-Control",
    value: `public, max-age=${DAY * 7}, stale-while-revalidate=${DAY}`,
  },
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

// Images uploaded from the admin panel are served by the API (or a custom media
// domain) and optimised by next/image, so their host must be allowed here.
function remotePattern(value) {
  try {
    const url = new URL(value);
    return {
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      ...(url.port && { port: url.port }),
      pathname: "/**",
    };
  } catch {
    return null;
  }
}
const mediaHosts = [process.env.NEXT_PUBLIC_API_URL, process.env.NEXT_PUBLIC_MEDIA_URL]
  .filter(Boolean)
  .map(remotePattern)
  .filter(Boolean);
const isDev = process.env.NODE_ENV !== "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    // qualities used by <Image quality={...}> in the project (Next 16 only
    // allows the values listed here)
    qualities: [75, 90, 95],
    minimumCacheTTL: DAY * 30,
    remotePatterns: isDev
      ? [...mediaHosts, { protocol: "http", hostname: "localhost", port: "8787", pathname: "/**" }]
      : mediaHosts,
    // `wrangler dev` runs on localhost, which next/image blocks unless allowed
    dangerouslyAllowLocalIP: isDev,
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // never index or cache the admin panel
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/video/:path*", headers: mediaCache },
      { source: "/video.mp4", headers: mediaCache },
      { source: "/audio/:path*", headers: mediaCache },
      { source: "/textures/:path*", headers: mediaCache },
    ];
  },
};

export default nextConfig;
