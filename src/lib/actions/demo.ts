"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { seedVeronica } from "@/lib/demo/veronica";
import { RATE_LIMITS, checkRateLimit } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/security/request";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * "Try the demo as Veronica": one tap, no sign-up. Creates an isolated anonymous session with
 * Veronica's data. Rate-limited per IP and globally; demo users are purged after 24 hours.
 * A form POST (not a link), so router prefetching can never create sessions.
 */
export async function startDemo(): Promise<void> {
  const existing = await getSessionUser();
  // Already exploring (or signed in for real): just open the plan, never overwrite real data.
  if (existing) redirect("/plan");

  const ip = await clientIp();
  const [perIp, global] = await Promise.all([
    checkRateLimit(`demo:ip:${ip}`, RATE_LIMITS.demoPerIp),
    checkRateLimit("demo:global", RATE_LIMITS.demoGlobal),
  ]);
  if (!perIp || !global) redirect("/demo?error=busy");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    console.error(JSON.stringify({ event: "demo_sign_in_error", code: error?.code }));
    redirect("/demo?error=unavailable");
  }

  await seedVeronica(data.user.id);
  redirect("/plan");
}

/** Puts Veronica's demo back to the starting point. Only for demo (anonymous) users. */
export async function resetDemo(): Promise<void> {
  const user = await getSessionUser();
  if (!user?.isAnonymous) redirect("/plan");
  await seedVeronica(user.id);
  redirect("/plan?reset=1");
}

/** Leaves the demo and starts a real account. */
export async function leaveDemo(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/sign-in");
}
