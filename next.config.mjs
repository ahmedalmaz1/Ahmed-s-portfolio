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

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    // qualities used by <Image quality={...}> in the project (Next 16 only
    // allows the values listed here)
    qualities: [75, 90, 95],
    minimumCacheTTL: DAY * 30,
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/video/:path*", headers: mediaCache },
      { source: "/video.mp4", headers: mediaCache },
      { source: "/audio/:path*", headers: mediaCache },
      { source: "/textures/:path*", headers: mediaCache },
    ];
  },
};

export default nextConfig;
