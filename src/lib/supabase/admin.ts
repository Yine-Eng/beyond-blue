import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";

/**
 * Secret-key client that bypasses Row Level Security. Server-only, and used in exactly three
 * places: the demo seeder, rate limiting, and scheduled cleanup (docs/architecture.md §7.1).
 */
export function createSupabaseAdminClient() {
  const { url } = getSupabasePublicEnv();
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) throw new Error("Missing SUPABASE_SECRET_KEY (server-only, see .env.example).");
  return createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
