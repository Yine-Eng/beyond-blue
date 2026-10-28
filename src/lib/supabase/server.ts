import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";

/**
 * Supabase client for Server Components and Server Actions, acting as the signed-in user,
 * so Row Level Security applies to every query. Reads cookies, so callers must sit behind
 * a <Suspense> boundary (Cache Components).
 */
export async function createSupabaseServerClient() {
  const { url, publishableKey } = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only. The proxy refreshes
          // the session on every request, so this is safe to ignore.
        }
      },
    },
  });
}
