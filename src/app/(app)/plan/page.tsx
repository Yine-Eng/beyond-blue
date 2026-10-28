import type { Metadata } from "next";
import { PlaceholderPanel } from "@/components/states/placeholder-panel";

export const metadata: Metadata = { title: "Plan" };

export default function PlanPage() {
  return (
    <>
      <h1 className="text-heading-lg text-navy-900 mb-6 font-serif font-bold">Your 100-Day Plan</h1>
      <PlaceholderPanel title="Coming soon">
        <p>The countdown, readiness areas and tasks arrive in M2.</p>
      </PlaceholderPanel>
    </>
  );
}
