import { Briefcase, Compass, type LucideIcon, MapPin, PiggyBank, UsersRound } from "lucide-react";
import type { AreaId } from "@/content/readiness-areas";

/** Card tint, accent text and icon per readiness area (docs/design-system.md §2.5). */
export const AREA_META: Record<
  AreaId,
  { tint: string; ink: string; icon: LucideIcon; blurb: string }
> = {
  career: {
    tint: "bg-area-career",
    ink: "text-blue-700",
    icon: Briefcase,
    blurb: "Offers, goals and a strong start",
  },
  financial: {
    tint: "bg-area-financial",
    ink: "text-gold-800",
    icon: PiggyBank,
    blurb: "Paycheck, benefits and savings",
  },
  relocation: {
    tint: "bg-area-relocation",
    ink: "text-teal-700",
    icon: MapPin,
    blurb: "Housing, moving and transportation",
  },
  network: {
    tint: "bg-area-network",
    ink: "text-purple-700",
    icon: UsersRound,
    blurb: "Alumni, mentors and new-city connections",
  },
  wellness: {
    tint: "bg-area-wellness",
    ink: "text-pink-700",
    icon: Compass,
    blurb: "Routines, resilience and your backup plan",
  },
};

export const OUTPUT_LABEL = {
  file: "Upload a file",
  link: "Share a link",
  form: "Fill in a form",
} as const;
