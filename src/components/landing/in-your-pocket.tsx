import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { pocket } from "@/content/copy/landing";
import { NotebookSection } from "./notebook-section";

/** A phone frame showing a simplified, decorative rendering of an app screen (slide 7). */
function Phone({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <figcaption className="odd:text-navy-900 font-serif text-2xl font-black uppercase even:text-orange-700">
        {label}
      </figcaption>
      <p className="sr-only">{description}</p>
      <div
        aria-hidden="true"
        className="bg-ink-900 w-full max-w-[15rem] rounded-[2.2rem] p-2.5 shadow-[6px_8px_0_rgb(10_45_115/0.25)]"
      >
        <div className="bg-paper relative flex aspect-[9/18.5] flex-col overflow-hidden rounded-[1.7rem] px-3 pt-6 text-[0.6rem] leading-snug">
          <div className="bg-ink-900 absolute top-0 left-1/2 h-4 w-20 -translate-x-1/2 rounded-b-xl" />
          <p className="text-navy-900 font-serif text-[0.7rem] font-bold uppercase">Beyond Blue</p>
          <p className="text-ink-600 text-[0.5rem]">Bluefield State University</p>
          <div className="mt-3 flex-1">{children}</div>
          <div className="text-ink-600 -mx-3 flex justify-around border-t bg-white py-2 text-[0.5rem]">
            {["Home", "Plan", "Network", "Profile"].map((tab) => (
              <span
                key={tab}
                className={
                  tab === label || (label === "Prepare" && tab === "Plan")
                    ? "text-navy-900 font-bold"
                    : ""
                }
              >
                {tab}
              </span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

const Card = ({
  className = "bg-white",
  children,
}: {
  className?: string;
  children: ReactNode;
}) => <div className={`${className} mb-1.5 rounded-md border px-2 py-1.5`}>{children}</div>;

export function InYourPocket() {
  return (
    <NotebookSection id="in-your-pocket" labelledBy="pocket-title">
      <div className="text-center">
        <h2
          id="pocket-title"
          className="bg-navy-800 font-script text-display-md text-cream-100 inline-block -rotate-1 px-6 py-2"
        >
          {pocket.title[0]} <span className="text-blue-300">{pocket.title[1]}</span>
        </h2>
        <p className="text-body-lg mx-auto mt-5 max-w-3xl font-serif">{pocket.description}</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal>
          <Phone
            label="Profile"
            description="Profile screen: Veronica Thompson, Senior, Class of 2027, Computer Science, with her destination role, target city Atlanta and journey tags."
          >
            <div className="text-navy-900 mx-auto grid size-14 place-items-center rounded-full bg-blue-100 font-serif text-xl font-bold">
              VT
            </div>
            <p className="text-navy-900 mt-2 text-center font-serif text-[0.75rem] font-bold">
              Veronica Thompson
            </p>
            <p className="text-ink-600 text-center">Senior · Class of 2027</p>
            <Card className="bg-success-50 mt-2">
              <span className="font-bold text-green-700">HIRED</span>
              <br />
              You did it! Now prepare for a strong start.
            </Card>
            <Card>Program Manager · Software Engineer</Card>
            <Card>Atlanta, GA</Card>
            <div className="mt-1 grid grid-cols-3 gap-1 text-center text-[0.5rem]">
              <span className="bg-area-career rounded p-1">First-Gen</span>
              <span className="rounded bg-[#f9ead6] p-1">Relocating</span>
              <span className="bg-area-relocation rounded p-1">Fin. Indep.</span>
            </div>
            <div className="bg-navy-900 mt-2 rounded-md py-1.5 text-center font-semibold text-white">
              View My Beyond Blue →
            </div>
          </Phone>
        </Reveal>

        <Reveal>
          <Phone
            label="Personalize"
            description="Personalize screen: Build Your Beyond Blue, choose where you're headed from five pathways and pick journey tags, then Create My 100-Day Plan."
          >
            <p className="text-navy-900 font-serif text-[0.75rem] font-bold">
              Build Your Beyond Blue
            </p>
            <p className="text-navy-900 mt-1 font-semibold">Where are you headed?</p>
            <Card className="border-navy-900 bg-area-career mt-1">
              ✓ Hired · I already have a job.
            </Card>
            {["Job Search", "Graduate School", "Entrepreneurship", "Still Deciding"].map((p) => (
              <Card key={p}>{p}</Card>
            ))}
            <p className="text-navy-900 mt-1 font-semibold">What describes your journey?</p>
            <div className="mt-1 flex flex-wrap gap-1 text-[0.5rem]">
              <span className="bg-area-career rounded border px-1">✓ First-Generation</span>
              <span className="bg-area-career rounded border px-1">✓ Relocating</span>
              <span className="rounded border bg-white px-1">Parent / Caregiver</span>
            </div>
            <div className="bg-navy-900 mt-2 rounded-md py-1.5 text-center font-semibold text-white">
              Create My 100-Day Plan →
            </div>
          </Phone>
        </Reveal>

        <Reveal>
          <Phone
            label="Prepare"
            description="Prepare screen: Good morning, Veronica. 87 days to graduation, a progress bar, the current curriculum task and five readiness area cards."
          >
            <p className="text-ink-600">Good morning, Veronica.</p>
            <p className="text-navy-900 font-serif text-[0.8rem] font-bold">
              87 Days to Graduation
            </p>
            <div className="bg-cream-50 mt-1 h-1.5 rounded-full">
              <div className="bg-navy-900 h-full w-2/5 rounded-full" />
            </div>
            <p className="text-ink-600 mt-0.5 text-right text-[0.5rem]">12 of 30 steps complete</p>
            <Card className="bg-area-career mt-1">
              <span className="text-[0.5rem] font-bold text-blue-700">CAREER READINESS</span>
              <br />
              Finalize onboarding documents
            </Card>
            <Card className="bg-area-financial">Financial Readiness ›</Card>
            <Card className="bg-area-relocation">Relocation & Life Logistics ›</Card>
            <Card className="bg-area-network">Network & Mentorship ›</Card>
            <Card className="bg-area-wellness">Wellness & Detour Planning ›</Card>
          </Phone>
        </Reveal>

        <Reveal>
          <Phone
            label="Connect"
            description="Connect screen: Your Beyond Blue Network with students on your path and alumni you may want to meet, each with a reason for the match and a Connect button."
          >
            <p className="text-navy-900 font-serif text-[0.75rem] font-bold">
              Your Beyond Blue Network
            </p>
            <p className="text-ink-600">You&apos;re not doing this alone.</p>
            <div className="mt-1 grid grid-cols-3 gap-1 text-center">
              {[
                ["18", "hired"],
                ["11", "relocating"],
                ["6", "Atlanta"],
              ].map(([n, l]) => (
                <span key={l} className="bg-area-career rounded p-1">
                  <b className="text-navy-900 text-[0.7rem]">{n}</b>
                  <br />
                  {l}
                </span>
              ))}
            </div>
            <p className="text-navy-900 mt-2 font-semibold">Alumni You May Want to Meet</p>
            {[
              ["TJ", "Tasha J.", "Software Engineer · Atlanta"],
              ["DR", "Dana R.", "PhD Student · Informatics"],
              ["ML", "Marcus L.", "Project Manager · Fintech"],
            ].map(([i, n, r]) => (
              <Card key={n}>
                <div className="flex items-center gap-1.5">
                  <span className="text-navy-900 grid size-6 place-items-center rounded-full bg-blue-100 font-bold">
                    {i}
                  </span>
                  <span className="flex-1">
                    <b>{n}</b>
                    <br />
                    {r}
                  </span>
                  <span className="border-navy-900 text-navy-900 rounded border px-1">Connect</span>
                </div>
              </Card>
            ))}
          </Phone>
        </Reveal>
      </div>
    </NotebookSection>
  );
}
