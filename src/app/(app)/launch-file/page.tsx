import type { Metadata } from "next";
import { PlaceholderPanel } from "@/components/states/placeholder-panel";

export const metadata: Metadata = { title: "Launch File" };

export default function LaunchFilePage() {
  return (
    <>
      <h1 className="text-heading-lg text-navy-900 mb-6 font-serif font-bold">
        My Beyond Blue Launch File
      </h1>
      <PlaceholderPanel title="Coming in the next release">
        <p>
          Every output you complete is already saved. Your Launch File will assemble them into your
          next-step plan, financial prep, strategy, network, resources and Detour plan, ready to
          download as a PDF.
        </p>
      </PlaceholderPanel>
    </>
  );
}
