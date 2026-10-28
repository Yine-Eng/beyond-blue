"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { seedVeronica } from "@/lib/demo/veronica";
import { RATE_LIMITS, checkRateLimit } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/security/request";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

/**
 * "View as staff (demo)": an anonymous session marked as a staff demo. It never gets the staff
 * role (so RLS shows it nothing real); the staff screens show generated fictional data instead.
 * Same rate limits and 24-hour purge as the student demo.
 */
export async function startStaffDemo(): Promise<void> {
  const existing = await getSessionUser();
  if (existing) redirect(existing.demoRole === "staff" ? "/staff" : "/plan");

  const ip = await clientIp();
  const [perIp, global] = await Promise.all([
    checkRateLimit(`demo:ip:${ip}`, RATE_LIMITS.demoPerIp),
    checkRateLimit("demo:global", RATE_LIMITS.demoGlobal),
  ]);
  if (!perIp || !global) redirect("/demo?error=busy");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInAnonymously({
    options: { data: { demo_role: "staff" } },
  });
  if (error || !data.user) {
    console.error(JSON.stringify({ event: "staff_demo_sign_in_error", code: error?.code }));
    redirect("/demo?error=unavailable");
  }
  const { error: profileError } = await createSupabaseAdminClient()
    .from("profiles")
    .update({ is_demo: true, preferred_name: "Demo staff", full_name: "Demo staff member" })
    .eq("id", data.user.id);
  if (profileError) throw profileError;
  redirect("/staff");
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
