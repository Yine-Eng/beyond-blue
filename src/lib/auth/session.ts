import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Data access layer for the signed-in user (Next.js DAL pattern). Every page and Server Action
 * gets the user from here rather than trusting the client. Reads cookies, so callers sit behind
 * a <Suspense> boundary. `cache` dedupes lookups within one request.
 */

export type SessionUser = { id: string; email: string | null; isAnonymous: boolean };

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return {
    id: claims.sub,
    email: typeof claims.email === "string" && claims.email ? claims.email : null,
    isAnonymous: claims.is_anonymous === true,
  };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  return user;
}

/** The student's profile, plan and cohort in one round of queries (RLS limits it to their own). */
export const getStudentContext = cache(async () => {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const [profileRes, planRes] = await Promise.all([
    supabase.from("profiles").select("*, cohort:cohorts(*)").eq("id", user.id).single(),
    supabase.from("student_plans").select("*").eq("student_id", user.id).maybeSingle(),
  ]);
  if (profileRes.error) throw profileRes.error;
  return { user, profile: profileRes.data, cohort: profileRes.data.cohort, plan: planRes.data };
});

export type StudentContext = Awaited<ReturnType<typeof getStudentContext>>;

/** For app screens: signed in and onboarded, otherwise sends the student to onboarding. */
export async function requirePlan() {
  const ctx = await getStudentContext();
  if (!ctx.plan) redirect("/onboarding");
  return { ...ctx, plan: ctx.plan };
}
