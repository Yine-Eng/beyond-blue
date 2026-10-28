import type { Metadata } from "next";
import { PlaceholderPanel } from "@/components/states/placeholder-panel";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <>
      <h1 className="text-heading-lg text-navy-900 mb-6 font-serif font-bold">Profile</h1>
      <PlaceholderPanel title="Coming soon">
        <p>Your profile, destination and journey tags arrive in M2.</p>
      </PlaceholderPanel>
    </>
  );
}
