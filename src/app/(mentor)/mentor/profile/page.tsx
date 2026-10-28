import type { Metadata } from "next";
import { Suspense } from "react";
import { MentorProfileForm } from "@/components/mentor/mentor-profile-form";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { requireMentor } from "@/lib/data/mentor";

export const metadata: Metadata = { title: "Mentor profile" };

async function EditContent() {
  const { mentor } = await requireMentor();
  return (
    <MentorProfileForm
      initial={{
        displayName: mentor.display_name,
        roleTitle: mentor.role_title,
        employer: mentor.employer ?? "",
        industry: mentor.industry ?? "",
        city: mentor.city ?? "",
        gradSchool: mentor.grad_school ?? "",
        bio: mentor.bio ?? "",
        pathways: mentor.pathways,
        journeyTags: mentor.journey_tags,
        capacity: mentor.capacity,
        isAvailable: mentor.is_available,
      }}
    />
  );
}

export default function MentorProfilePage() {
  return (
    <>
      <h1 className="text-heading-lg text-navy-900 mb-2 font-serif font-bold">Mentor profile</h1>
      <p className="text-ink-600 mb-6">
        Students see your name, role, employer, city and the tags you choose to show.
      </p>
      <Suspense fallback={<PlanSkeleton />}>
        <EditContent />
      </Suspense>
    </>
  );
}
