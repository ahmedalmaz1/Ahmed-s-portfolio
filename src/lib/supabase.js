import "server-only";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_KEY. Add them to .env.local (see .env.example).",
  );
}

// Server-only client (route handlers, server actions, server components).
// The variables are intentionally NOT prefixed with NEXT_PUBLIC_, so the key
// never reaches the browser bundle.
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
