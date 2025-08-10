import { createClient } from "@supabase/supabase-js";

/**
 * Server-side admin client using the Supabase service role key.
 * Bypasses RLS for secure backend/admin operations.
 * DO NOT expose the service role key to the browser.
 */
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) {
    throw new Error("Missing Supabase admin env vars");
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
