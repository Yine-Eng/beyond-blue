import type { Metadata } from "next";
import { Suspense } from "react";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { ProfileForm } from "@/components/profile/profile-form";
import { requirePlan } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Edit profile" };

async function EditContent() {
  const { profile } = await requirePlan();
  return (
    <ProfileForm
      initial={{
        preferredName: profile.preferred_name ?? "",
        fullName: profile.full_name ?? "",
        major: profile.major ?? "",
        destinationRole: profile.destination_role ?? "",
        targetCity: profile.target_city ?? "",
        journeyTags: profile.journey_tags,
      }}
    />
  );
}

export default function EditProfilePage() {
  return (
    <>
      <h1 className="text-heading-lg text-navy-900 mb-6 font-serif font-bold">Edit profile</h1>
      <Suspense fallback={<PlanSkeleton />}>
        <EditContent />
      </Suspense>
    </>
  );
}
