import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { FundCategory, FundStatus } from "@/content/fund";
import { getStudentContext } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const REQUEST_COLUMNS =
  "id, category, amount_cents, next_step, justification, document_path, needed_by, status, rubric, reviewer_notes, submitted_at, decided_at, updated_at";

/**
 * Who is signed in and whether they're staff. The role always comes from the database (never a
 * JWT claim), so a role change applies on the next request with no new sign-in, and a role check
 * never touches the session.
 */
export const getStaffAccess = cache(async () => {
  const ctx = await getStudentContext();
  const isStaff = ctx.profile.role === "staff" || ctx.profile.role === "admin";
  return { ...ctx, isStaff };
});

/**
 * Staff and admins only. The staff layout already shows non-staff a "Staff only" page without
 * rendering the route, so this is defence in depth for data loaders and Server Actions.
 */
export const requireStaff = cache(async () => {
  const access = await getStaffAccess();
  if (!access.isStaff) redirect("/staff");
  return access;
});

export async function getFundBalance() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("fund_balance").single();
  if (error) throw error;
  return data;
}

/** The student's requests, newest first; the first open one (if any) is the current request. */
export async function getMyFundRequests(studentId: string) {
  const supabase = await createSupabaseServerClient();
  const [requestsRes, balance] = await Promise.all([
    supabase
      .from("fund_requests")
      .select(REQUEST_COLUMNS)
      .eq("student_id", studentId)
      .order("submitted_at", { ascending: false }),
    getFundBalance(),
  ]);
  if (requestsRes.error) throw requestsRes.error;
  const open = requestsRes.data.find((r) =>
    ["submitted", "in_review", "needs_info"].includes(r.status),
  );
  return { requests: requestsRes.data, open: open ?? null, capCents: balance.request_cap_cents };
}

export type QueueFilters = { status?: FundStatus; category?: FundCategory };

/** Review queue, oldest first. Demo sessions never reach the real queue. */
export async function getFundQueue(filters: QueueFilters) {
  await requireStaff();
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("fund_requests")
    .select(
      "id, category, amount_cents, next_step, needed_by, status, submitted_at, student:profiles!fund_requests_student_id_fkey!inner(preferred_name, full_name, is_demo)",
    )
    .eq("student.is_demo", false)
    .order("submitted_at", { ascending: true });
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.category) query = query.eq("category", filters.category);
  const [requestsRes, balance] = await Promise.all([query, getFundBalance()]);
  if (requestsRes.error) throw requestsRes.error;
  return { requests: requestsRes.data, balance };
}

/** One request with the student's basics and a short-lived link to the document. */
export async function getFundRequestForReview(id: string) {
  await requireStaff();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("fund_requests")
    .select(
      `${REQUEST_COLUMNS}, student:profiles!fund_requests_student_id_fkey(preferred_name, full_name, major, target_city, class_year)`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  let documentUrl: string | null = null;
  if (data.document_path) {
    const { data: signed } = await supabase.storage
      .from("fund-docs")
      .createSignedUrl(data.document_path, 60 * 15);
    documentUrl = signed?.signedUrl ?? null;
  }
  const balance = await getFundBalance();
  return { request: data, documentUrl, balance };
}
