import type { Metadata } from "next";
import { PlaceholderPanel } from "@/components/states/placeholder-panel";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return (
    <>
      <h1 className="text-heading-lg text-navy-900 mb-6 font-serif font-bold">
        Welcome to Beyond Blue
      </h1>
      <PlaceholderPanel title="Coming soon">
        <p>Your countdown, today&apos;s focus and quick links land here in M2.</p>
      </PlaceholderPanel>
    </>
  );
}
