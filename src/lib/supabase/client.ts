"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";

/** Browser client (signed-in user, RLS applies). Used for direct uploads to Storage. */
export function createSupabaseBrowserClient() {
  const { url, publishableKey } = getSupabasePublicEnv();
  return createBrowserClient<Database>(url, publishableKey);
}
