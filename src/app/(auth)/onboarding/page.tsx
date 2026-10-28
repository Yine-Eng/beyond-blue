import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getStudentContext } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Build your plan" };

async function OnboardingGate() {
  const { profile, plan } = await getStudentContext();
  if (plan) redirect("/plan");
  return <OnboardingFlow defaultName={profile.preferred_name ?? ""} />;
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={<div aria-busy="true" className="bg-cream-50 h-96 animate-pulse rounded-lg" />}
    >
      <OnboardingGate />
    </Suspense>
  );
}
