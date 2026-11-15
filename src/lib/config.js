// Single source of truth for the API address (shared by the public site and the admin panel).
// Development falls back to `wrangler dev`; production requires NEXT_PUBLIC_API_URL.
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:8787")
).replace(/\/$/, "");
