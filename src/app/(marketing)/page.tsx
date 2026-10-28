import { AlumniLoopSection } from "@/components/landing/alumni-loop-section";
import { BudgetSection } from "@/components/landing/budget-section";
import { BuiltToLast } from "@/components/landing/built-to-last";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCta, SiteFooter } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InYourPocket } from "@/components/landing/in-your-pocket";
import { Launchpad } from "@/components/landing/launchpad";
import { MeetVeronica } from "@/components/landing/meet-veronica";
import { NotAlone } from "@/components/landing/not-alone";
import { PathwaysSection } from "@/components/landing/pathways-section";

/** The public story site: the pitch deck, brought to life, in deck order. */
export default function StoryPage() {
  return (
    <>
      <Hero />
      <MeetVeronica />
      <NotAlone />
      <PathwaysSection />
      <HowItWorks />
      <InYourPocket />
      <AlumniLoopSection />
      <BuiltToLast />
      <BudgetSection />
      <Launchpad />
      <FaqSection />
      <FinalCta />
      <SiteFooter />
    </>
  );
}
