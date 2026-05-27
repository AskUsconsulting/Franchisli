import { createClient } from "@supabase/supabase-js";

// Admin client uses the secret key — NEVER import this in client components or expose to the browser.
// Use only in server actions, API routes, or server-side scripts.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
