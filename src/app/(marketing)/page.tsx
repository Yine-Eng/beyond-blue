import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InYourPocket } from "@/components/landing/in-your-pocket";
import { MeetVeronica } from "@/components/landing/meet-veronica";
import { NotAlone } from "@/components/landing/not-alone";
import { PathwaysSection } from "@/components/landing/pathways-section";

/** The public story site: the pitch deck, brought to life. */
export default function StoryPage() {
  return (
    <>
      <Hero />
      <MeetVeronica />
      <NotAlone />
      <PathwaysSection />
      <HowItWorks />
      <InYourPocket />
    </>
  );
}
