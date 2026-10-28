import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type RateLimitRule = { max: number; windowSeconds: number };

/** Limits used across the app (docs/architecture.md §7.4). */
export const RATE_LIMITS = {
  /** Anonymous demo sessions per IP address. */
  demoPerIp: { max: 5, windowSeconds: 60 * 60 },
  /** Demo sessions across everyone, so a flood can't fill the database. */
  demoGlobal: { max: 300, windowSeconds: 60 * 60 },
  magicLinkPerEmail: { max: 3, windowSeconds: 15 * 60 },
  magicLinkPerIp: { max: 10, windowSeconds: 15 * 60 },
  uploadUrlPerUser: { max: 30, windowSeconds: 60 * 60 },
} as const satisfies Record<string, RateLimitRule>;

/**
 * Fixed-window rate limit backed by Postgres (`app.rate_limit`). Returns true when allowed.
 * Fails closed: if the limiter itself errors, the action is refused.
 */
export async function checkRateLimit(key: string, rule: RateLimitRule): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("check_rate_limit", {
    p_key: key,
    p_max: rule.max,
    p_window_seconds: rule.windowSeconds,
  });
  if (error) {
    console.error(
      JSON.stringify({ event: "rate_limit_error", key: key.split(":")[0], message: error.message }),
    );
    return false;
  }
  return data === true;
}
