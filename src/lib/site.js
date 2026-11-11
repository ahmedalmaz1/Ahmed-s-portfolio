export const SITE_NAME = "Ahmed Almaz";

// Set NEXT_PUBLIC_SITE_URL to the production domain (e.g. https://ahmedalmaz.com).
// On Vercel the production URL is picked up automatically as a fallback.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelHost ? `https://${vercelHost}` : "http://localhost:3000")
).replace(/\/$/, "");
