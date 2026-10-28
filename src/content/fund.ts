import type { Database } from "@/lib/supabase/database.types";

/** Last Mile Fund wording (deck: "small, verified, capped micro-grants"; PRD US-FUND-1/2). */

export type FundCategory = Database["public"]["Enums"]["fund_category"];
export type FundStatus = Database["public"]["Enums"]["fund_status"];

export const FUND_CATEGORIES: readonly { id: FundCategory; label: string }[] = [
  { id: "certification_fee", label: "Certification or licensing fee" },
  { id: "background_check", label: "Background check" },
  { id: "interview_travel", label: "Interview travel" },
  { id: "deposit", label: "Housing deposit" },
  { id: "relocation", label: "Relocation costs" },
  { id: "other", label: "Other cost tied to my next step" },
];

export const categoryLabel = (id: FundCategory) =>
  FUND_CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const FUND_STATUS: Record<FundStatus, { label: string; tone: string }> = {
  submitted: { label: "Submitted", tone: "bg-blue-100 text-blue-700" },
  in_review: { label: "In review", tone: "bg-area-financial text-gold-800" },
  needs_info: { label: "Needs info", tone: "bg-area-career text-pink-700" },
  approved: { label: "Approved", tone: "bg-success-50 text-green-700" },
  declined: { label: "Declined", tone: "bg-cream-200 text-ink-900" },
};

/** The same four checks for every request. All must be met to approve. */
export const FUND_RUBRIC = [
  { id: "next_step", label: "Tied to a real, specific next step" },
  { id: "documented", label: "The cost is documented or clearly explained" },
  { id: "within_cap", label: "Within the per-request cap and reasonable for the need" },
  { id: "no_other_source", label: "No other campus source covers it in time" },
] as const;

export type RubricId = (typeof FUND_RUBRIC)[number]["id"];

export const FUND_DOCUMENT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
