import type { Metadata } from "next";
import { PlaceholderPanel } from "@/components/states/placeholder-panel";

export const metadata: Metadata = { title: "Network" };

export default function NetworkPage() {
  return (
    <>
      <h1 className="text-heading-lg text-navy-900 mb-6 font-serif font-bold">
        Your Beyond Blue Network
      </h1>
      <PlaceholderPanel title="Coming soon">
        <p>Alumni matches and connections arrive in M3.</p>
      </PlaceholderPanel>
    </>
  );
}
